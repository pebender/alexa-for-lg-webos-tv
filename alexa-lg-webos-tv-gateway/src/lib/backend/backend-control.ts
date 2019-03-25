import {GenericError,
    UninitializedClassError} from "alexa-lg-webos-tv-common";
import {Client as SsdpClient,
    SsdpHeaders} from "node-ssdp";
import {DatabaseTable} from "../database";
import EventEmitter from "events";
const LGTV = require("lgtv2");
import {Mutex} from "async-mutex";
import {TV} from "../common";
import uuid from "uuid/v4";
const wol = require("wol");

export interface LGTVRequest {
    uri: string;
    payload?: any;
}

export type LGTVResponse = any;

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
    private _throwIfNotInitialized: (methodName: string) => void
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

        this._throwIfNotInitialized = (methodName: string) => {
            if (this._initialized === false) {
                throw new UninitializedClassError("BackendControl", methodName);
            }
        };
    }

    public initialize(): Promise<void> {
        const that: BackendControl = this;

        function saveKey(key: string, callback: (error: any) => void): void {
            that._db.updateRecord(
                {"udn": that._tv.udn},
                {"$set": {"key": key}}
            ).
                catch((error: any) => {
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
        return that._initializeMutex.runExclusive(() => new Promise<void>((resolve, reject) => {
            if (that._initialized === true) {
                resolve();
                return;
            }

            let clientKey = "";
            if (Reflect.has(that._tv, "key")) {
                clientKey = (that._tv.key as string);
                Reflect.deleteProperty(that._tv, "key");
            } else {
                reject(new GenericError("error", "initial LGTV key not set"));
            }

            that._connection = new LGTV({
                "url": that._tv.url,
                "timeout": 10000,
                "reconnect": 0,
                "clientKey": clientKey,
                "saveKey": saveKey
            });
            that._connection.on("error", (error: any) => {
                that._connecting = false;
                if (error && error.code !== "EHOSTUNREACH") {
                    that.emit("error", error, that._tv.udn);
                }
            });
            // eslint-disable-next-line no-unused-vars
            that._connection.on("connecting", () => {
                that._connecting = true;
            });
            that._connection.on("connect", () => {
                that._connecting = false;
                that._powerOn = true;
            });
            that._connection.on("close", () => {
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
        this._throwIfNotInitialized("get+tv");
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
        this._throwIfNotInitialized("turnOff");
        const command = {
            "uri": "ssap://system/turnOff"
        };
        this._connection.request(command.uri);
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

        function startInterval(milliseconds: number, handler: (...args: any[]) => void, ...args: any[]): NodeJS.Timeout {
            handler(...args);
            return setInterval(handler, milliseconds, ...args);
        }

        that._throwIfNotInitialized("turnOn");

        return new Promise<boolean>((resolveTurnOn) => {
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
            function finish(poweredOn: boolean): Promise<any> {
                if (finished === true) {
                    return Promise.resolve(true);
                }
                return finishMutex.runExclusive(() => new Promise<any>((resolveFinish) => {
                    if (finished === true) {
                        resolveFinish(null);
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
                    resolveFinish(finishUUID);
                })).
                    then((currentUUID: string | null) => {
                        if (finished === false) {
                            if (currentUUID !== null && currentUUID === finishUUID) {
                                finishUUID = null;
                                finished = true;
                                resolveTurnOn(poweredOn);
                            }
                        }
                    });
            }

            finishTimeoutObject = setTimeout(finish, 7000, false);

            monitorTimeoutObject = startInterval(100, () => {
                if (that._powerOn === true) {
                    finish(true);
                }
            });
            wolTimeoutObject = startInterval(250, () => {
                wol.wake(that._tv.mac);
            });
            searchTimeoutObject = startInterval(1000, () => {
                if (that._ssdpResponse !== null) {
                    that._ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
                }
            });
        });
    }

    public getPowerState(): "OFF" | "ON" {
        this._throwIfNotInitialized("getPowerState");
        return this._powerOn
            ? "ON"
            : "OFF";
    }

    public async lgtvCommand(lgtvRequest: LGTVRequest): Promise<LGTVResponse> {
        this._throwIfNotInitialized("lgtvCommand");
        let lgtvResponse = null;
        if (lgtvRequest.payload === null) {
            lgtvResponse = await new Promise<LGTVResponse>((resolve, reject) => {
                this._connection.request(
                    lgtvRequest.uri,
                    (error: any, response: LGTVResponse) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(response);
                    }
                );
            });
        } else {
            lgtvResponse = await new Promise((resolve, reject) => {
                this._connection.request(
                    lgtvRequest.uri,
                    lgtvRequest.payload,
                    (error: any, response: LGTVResponse) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(response);
                    }
                );
            });
        }
        if (Reflect.has(lgtvResponse, "returnValue") === false) {
            throw new GenericError("lgtvCommand:failed", "The LGTV response did not contain 'returnValue'.");
        }
        if (lgtvResponse.returnValue !== true) {
            throw new GenericError("lgtvCommand:failed", "The LGTV response value 'returnValue' is not true.");
        }
        Reflect.deleteProperty(lgtvResponse, "returnValue");
        return lgtvResponse;
    }
}