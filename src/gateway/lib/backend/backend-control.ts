/* eslint-disable max-lines */
import * as wol from "wake_on_lan";
import {LGTVRequest,
    LGTVResponse,
    UninitializedClassError} from "../../../common";
import {Client as SsdpClient,
    SsdpHeaders} from "node-ssdp";
import {DatabaseTable} from "../database";
import EventEmitter from "events";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LGTV = require("lgtv2");
import {Mutex} from "async-mutex";
import {TV} from "../tv";
import uuid from "uuid/v4";

export class BackendControl extends EventEmitter {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _db: DatabaseTable;
    private _connecting: boolean;
    private _powerOn: boolean;
    private _tv: TV;
    private _connection: any;
    private _ssdpNotify: SsdpClient;
    private _ssdpResponse: SsdpClient;
    public constructor(db: DatabaseTable, tv: TV) {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._db = db;
        this._connecting = false;
        this._powerOn = false;
        this._tv = {
            "udn": tv.udn,
            "name": tv.name,
            "ip": tv.ip,
            "url": tv.url,
            "mac": tv.mac,
            "key": ""
        };
        if (("key" in tv) && tv.key !== null) {
            this._tv.key = tv.key;
        }
        this._connection = null;
        this._ssdpNotify = new SsdpClient({"sourcePort": 1900});
        this._ssdpResponse = new SsdpClient();
    }

    private throwIfNotInitialized(methodName: string): void {
        if (this._initialized === false) {
            throw new UninitializedClassError("BackendControl", methodName);
        }
    }

    public initialize(): Promise<void> {
        const that: BackendControl = this;

        function saveKey(key: string, callback: (error: Error) => void): void {
            that._db.updateRecord(
                {"udn": that._tv.udn},
                {"$set": {"key": key}}
            ).
                catch((error): void => {
                    callback(error);
                    // eslint-disable-next-line no-useless-return
                    return;
                });
        }

        function ssdpConnectHandler(headers: SsdpHeaders): void {
            if (headers.USN === `${that._tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
                if (that._connecting === false) {
                    that._connection.connect(that._tv.url);
                }
            }
        }

        function ssdpDisconnectHandler(headers: SsdpHeaders): void {
            if (headers.USN === `${that._tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
                that._powerOn = false;
                that._connection.disconnect();
            }
        }
        return that._initializeMutex.runExclusive((): Promise<void> => new Promise<void>((resolve, reject): void => {
            if (that._initialized === true) {
                resolve();
            }

            let clientKey = "";
            if (typeof that._tv.key === "string") {
                clientKey = that._tv.key;
                Reflect.deleteProperty(that._tv, "key");
            } else {
                reject(new Error("initial LGTV key not set"));
            }

            that._connection = new LGTV({
                "url": that._tv.url,
                "timeout": 10000,
                "reconnect": 0,
                "clientKey": clientKey,
                "saveKey": saveKey
            });
            that._connection.on("error", (error: NodeJS.ErrnoException): void => {
                that._connecting = false;
                if (error && error.code !== "EHOSTUNREACH") {
                    that.emit("error", error, that._tv.udn);
                }
            });
            // eslint-disable-next-line no-unused-vars
            that._connection.on("connecting", (): void => {
                that._connecting = true;
            });
            that._connection.on("connect", (): void => {
                that._connecting = false;
                that._powerOn = true;
            });
            that._connection.on("close", (): void => {
                that._connecting = false;
            });
            that._ssdpNotify.on("advertise-alive", ssdpConnectHandler);
            that._ssdpNotify.on("advertise-bye", ssdpDisconnectHandler);
            that._ssdpNotify.start();
            that._ssdpResponse.on("response", ssdpConnectHandler);
            that._initialized = true;
        }));
    }

    public get tv(): TV {
        this.throwIfNotInitialized("get+tv");
        const tv = {
            "udn": this._tv.udn,
            "name": this._tv.name,
            "ip": this._tv.ip,
            "url": this._tv.url,
            "mac": this._tv.mac
        };
        return tv;
    }

    public turnOff(): boolean {
        this.throwIfNotInitialized("turnOff");
        const lgtvCommand = {
            "uri": "ssap://system/turnOff"
        };
        this._connection.request(lgtvCommand.uri);
        this._powerOn = false;
        return true;
    }

    /*
     * The method turns on the TV. It forces the BackendControl instance to
     * assume the TV is off and to disconnect from the TV. Then, it periodically
     * kicks the TV using Wake On Lan, periodically searches for the TV using
     * UPnP Discovery and waits for the BackendControl instance to detect that
     * the TV is on and connected. Before it does any of this, it sets a timeout
     * of 7 seconds in an attempt to ensure that Alexa has the chance for a
     * response before its 8 second timeout.
     */
    public turnOn(): Promise<boolean> {
        const that = this;

        function startInterval(milliseconds: number, handler: () => void): NodeJS.Timeout {
            handler();
            return setInterval(handler, milliseconds);
        }

        that.throwIfNotInitialized("turnOn");

        return new Promise<boolean>((resolveTurnOn): void => {
            that._powerOn = false;
            that._connection.disconnect();
            let finishTimeoutObject: NodeJS.Timeout | null = null;
            let monitorTimeoutObject: NodeJS.Timeout | null = null;
            let wolTimeoutObject: NodeJS.Timeout | null = null;
            let searchTimeoutObject: NodeJS.Timeout | null = null;

            /*
             * The function cleans up and then resolves the function's promise.
             * It uses a mutex and a uuid to ensure that clean up and the
             * function's promise resolution is only performed once. The mutex
             * protects the clean up phase ensures that clean up is called only
             * once. The uuid, which is set during the clean up phase, ensures
             * that the function's promise resolution is called only once.
             */
            let finished = false;
            const finishMutex = new Mutex();
            let finishUUID: string | null = null;
            async function finish(poweredOn: boolean): Promise<void> {
                const currentUUID = await finishMutex.runExclusive((): Promise<string | null> => new Promise<string | null>((resolve): void => {
                    if (finished === true) {
                        resolve(null);
                        return;
                    }
                    finishUUID = uuid();

                    if (wolTimeoutObject !== null) {
                        clearInterval(wolTimeoutObject);
                        wolTimeoutObject = null;
                    }
                    if (searchTimeoutObject !== null) {
                        clearInterval(searchTimeoutObject);
                        searchTimeoutObject = null;
                    }
                    if (monitorTimeoutObject !== null) {
                        clearInterval(monitorTimeoutObject);
                        monitorTimeoutObject = null;
                    }
                    if (finishTimeoutObject !== null) {
                        clearTimeout(finishTimeoutObject);
                        finishTimeoutObject = null;
                    }
                    resolve(finishUUID);
                }));
                if (finishUUID !== null && currentUUID === finishUUID) {
                    if (finished === false) {
                        finishUUID = null;
                        finished = true;
                        resolveTurnOn(poweredOn);
                    }
                }
            }

            finishTimeoutObject = setTimeout(finish, 7000, false);

            monitorTimeoutObject = startInterval(100, (): void => {
                if (that._powerOn === true) {
                    finish(true);
                }
            });
            wolTimeoutObject = startInterval(250, (): void => {
                wol.wake(that._tv.mac);
            });
            searchTimeoutObject = startInterval(1000, (): void => {
                if (that._ssdpResponse !== null) {
                    that._ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
                }
            });
        });
    }

    public getPowerState(): "OFF" | "ON" {
        this.throwIfNotInitialized("getPowerState");
        return this._powerOn
            ? "ON"
            : "OFF";
    }

    public async lgtvCommand(lgtvRequest: LGTVRequest): Promise<LGTVResponse> {
        this.throwIfNotInitialized("lgtvCommand");
        let lgtvResponse: LGTVResponse = {
            "returnValue": false
        };
        if (lgtvRequest.payload === null) {
            lgtvResponse = await new Promise<LGTVResponse>((resolve, reject): void => {
                this._connection.request(
                    lgtvRequest.uri,
                    (error: Error, response: LGTVResponse): void => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(response);
                    }
                );
            });
        } else {
            lgtvResponse = await new Promise((resolve, reject): void => {
                this._connection.request(
                    lgtvRequest.uri,
                    lgtvRequest.payload,
                    (error: Error, response: LGTVResponse): void => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(response);
                    }
                );
            });
        }
        if (typeof lgtvResponse.returnValue === "undefined") {
            throw new Error("'LGTVResponse' does not contain property 'returnValue'");
        }
        if (lgtvResponse.returnValue !== true) {
            throw new Error("'LGTVResponse' property 'returnValue' is not true");
        }
        return lgtvResponse;
    }
}