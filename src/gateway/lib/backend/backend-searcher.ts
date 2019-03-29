/*
 *******************************************************************************
 * I use UPnP discovery along with LG Electronics custom service type
 * urn:lge-com:service:webos-second-screen:1 to detect the LG webOS TVs. This
 * appears to be the most reliable way to find LG webOS TVs because of the more
 * targeted service type, the cleaner response headers and cleaner device
 * description fields. Other UPnP service types advertised by LG webOS TVs
 * appear to have either less consistent response headers or device description
 * fields making it more difficult to identify them. My LG webOS TV advertises
 * as UPnP 1.0. However, the discovery implemented complies with UPnP 1.1 it
 * accepts 1.1 as well.
 * <http://www.upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.0.pdf>
 * <http://www.upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf>
 *******************************************************************************
 */
import * as dgram from "dgram";
import {IP, MAC, TV, UDN} from "../tv";
import {Client as SsdpClient, SsdpHeaders} from "node-ssdp";
import EventEmitter from "events";
import {Mutex} from "async-mutex";
import {UninitializedClassError} from "../../../common";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const arp = require("node-arp");
import http from "axios";
import {parseString as xml2js} from "xml2js";

export class BackendSearcher extends EventEmitter {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _ssdpNotify: SsdpClient;
    private _ssdpResponse: SsdpClient;
    private _throwIfNotInitialized: (methodName: string) => void;
    public constructor() {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._ssdpNotify = new SsdpClient({"sourcePort": 1900});
        this._ssdpResponse = new SsdpClient();

        this._throwIfNotInitialized = (methodName) => {
            if (this._initialized === false) {
                throw new UninitializedClassError("BackendSearcher", methodName);
            }
        };
    }

    public initialize(): Promise<void> {
        const that: BackendSearcher = this;

        // Periodicly scan for TVs.
        function periodicSearch(): void {
            // Search every 1800s as that is the UPnP recommended time.
            that._ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
            setTimeout(periodicSearch, 1800000);
        }

        function ssdpProcessCallback(error: Error | null, tv: TV | null): void {
            if (error) {
                that.emit("error", error);
                return;
            }
            if (!tv) {
                return;
            }
            that.emit("found", tv);
        }

        function ssdpProcess(messageName: string, headers: SsdpHeaders, rinfo: dgram.RemoteInfo, callback: (error: Error | null, tv: TV | null) => void): void {
            const tv: {
                udn?: UDN;
                name?: string;
                ip?: IP;
                url?: string;
                mac?: MAC;
                key?: string;
            } = {};
            if (Reflect.has(headers, "USN") === false) {
                callback(null, null);
                return;
            }
            if ((headers.USN as string).endsWith("::urn:lge-com:service:webos-second-screen:1") === false) {
                callback(null, null);
                return;
            }
            const messageTypeMap: {[name: string]: string} = {
                "advertise-alive": "NT",
                "advertise-bye": "NT",
                "response": "ST"
            };
            if (Reflect.has(messageTypeMap, messageName) === false) {
                callback(null, null);
                return;
            }
            // Make sure it is the webOS second screen service.
            if (Reflect.has(headers, messageTypeMap[messageName]) === false) {
                callback(null, null);
                return;
            }
            if ((headers[messageTypeMap[messageName]] === "urn:lge-com:service:webos-second-screen:1") === false) {
                callback(null, null);
                return;
            }
            // Make sure that if it is a advertise (NT) message then it is "ssdp:alive".
            if ((messageTypeMap[messageName] === "NT") &&
                (Reflect.has(headers, "NTS") === false || (headers.NTS === "ssdp:alive") === false)) {
                callback(null, null);
                return;
            }
            // Make sure it is webOS and UPnP 1.0 or 1.1.
            if (!("SERVER" in headers) ||
                !(headers.SERVER as string).match(/^WebOS\/[\d.]+ UPnP\/1\.[01]$/i)) {
                callback(null, null);
                return;
            }
            // Get the IP address associated with the TV.
            if (!("address" in rinfo)) {
                callback(null, null);
                return;
            }
            tv.ip = rinfo.address;
            tv.url = `ws://${tv.ip}:3000`;

            /*
             * Get the device description. I use this to make sure that this is an
             * LG Electronics webOS TV as well as to obtain the TV's friendly name
             * and Unique Device Name (UDN).
             */
            if (!("LOCATION" in headers)) {
                callback(null, null);
                return;
            }
            http.get(headers.LOCATION).then((descriptionXml: any) => {
                xml2js(descriptionXml.data, (error: Error | null, description: any) => {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    if (!description) {
                        callback(null, null);
                        return;
                    }

                    /*
                     * These properties are required by the UPnP specification but
                     * check anyway.
                     */
                    if (!("root" in description) ||
                        !("device" in description.root) ||
                        description.root.device.length !== 1 ||
                        !("manufacturer" in description.root.device[0]) ||
                        description.root.device[0].manufacturer.length !== 1 ||
                        !("friendlyName" in description.root.device[0]) ||
                        description.root.device[0].friendlyName.length !== 1 ||
                        !("UDN" in description.root.device[0]) ||
                        description.root.device[0].UDN.length !== 1) {
                        callback(null, null);
                        return;
                    }

                    /*
                     * Make sure this is from LG Electronics and has both a friendly
                     * name and a UDN.
                     */
                    if (!description.root.device[0].manufacturer[0].match(/^LG Electronics$/i) ||
                        description.root.device[0].friendlyName[0] === "" ||
                        description.root.device[0].UDN[0] === "") {
                        callback(null, null);
                        return;
                    }
                    [tv.name] = description.root.device[0].friendlyName;
                    [tv.udn] = description.root.device[0].UDN;

                    /*
                     * Get the mac address needed to turn on the TV using wake on
                     * lan.
                     */
                    arp.getMAC(tv.ip, (err: Error, mac: MAC) => {
                        if (err) {
                            callback(err, null);
                            return;
                        }
                        tv.mac = mac;
                        callback(null, (tv as TV));
                        // eslint-disable-next-line no-useless-return
                        return;
                    });
                });
            });
        }

        return that._initializeMutex.runExclusive(() => new Promise<void>((resolve) => {
            if (that._initialized === true) {
                resolve();
                return;
            }

            that._ssdpNotify.on("advertise-alive", (headers: SsdpHeaders, rinfo: dgram.RemoteInfo): void => {
                ssdpProcess("advertise-alive", headers, rinfo, ssdpProcessCallback);
            });
            that._ssdpResponse.on("response", (headers: SsdpHeaders, statusCode: number, rinfo) => {
                if (statusCode !== 200) {
                    return;
                }
                ssdpProcess("response", headers, rinfo, ssdpProcessCallback);
            });
            that._ssdpNotify.start();
            setImmediate(periodicSearch);
            that._initialized = true;
            resolve();
        }));
    }

    public now(): void {
        this._throwIfNotInitialized("now");
        this._ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
    }
}