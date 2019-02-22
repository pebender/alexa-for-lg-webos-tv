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

const http = require("axios");
const EventEmitter = require("events");
const arp = require("node-arp");
const SSDPClient = require("node-ssdp").Client;
const xml2js = require("xml2js").parseString;

class LGTVSearcher extends EventEmitter {
    constructor() {

        super();

        const that = this;

        this.private = {};
        this.private.initialized = false;
        this.private.ssdpNotify = new SSDPClient({"sourcePort": "1900"});
        this.private.ssdpResponse = new SSDPClient();
        this.private.ssdpNotify.start();
        this.private.ssdpNotify.on("advertise-alive", (headers, rinfo) => {
            ssdpProcess("advertise-alive", headers, rinfo).
                then((tv) => {
                    if (tv) {
                        this.emit("found", tv);
                    }
                }).
                catch((error) => {
                    this.emit("error", error);
                });
        });
        this.private.ssdpNotify.on("advertise-bye", (headers, rinfo) => {
            ssdpProcess("advertise-bye", headers, rinfo).
                then((tv) => {
                    if (tv) {
                        this.emit("found", tv);
                    }
                }).
                catch((error) => {
                    this.emit("error", error);
                });
        });
        this.private.ssdpResponse.on("response", (headers, statusCode, rinfo) => {
            if (statusCode !== "200") {
                return;
            }
            ssdpProcess("response", headers, rinfo).
                then((tv) => {
                    if (tv !== null) {
                        this.emit("found", tv);
                    }
                }).
                catch((error) => {
                    this.emit("error", error);
                });
        });
        periodic();

        // Periodicly scan for TVs.
        function periodic() {
            // Search every 1800s as that is the UPnP recommended time.
            that.private.ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
            setTimeout(periodic, 1800000);
        }

        function ssdpProcess(type, headers, rinfo) {
            return addToTvFromHeader({}).
                then(addToTvFromDescription).
                then(addToTvFromMAC);

            function addToTvFromHeader(tv) {
                return new Promise((resolve) => {
                    if (tv === null) {
                        resolve(null);
                        return;
                    }
                    const typeMap = {
                        "advertise-alive": "NT",
                        "advertise-bye": "NT",
                        "response": "ST"
                    };
                    if (!(type in typeMap)) {
                        resolve(null);
                        return;
                    }
                    // Make sure it is webOS and UPnP 1.0 or 1.1.
                    if (!("SERVER" in headers) ||
                        !headers.SERVER.match(/^WebOS\/[\d.]+ UPnP\/1\.[01]$/i)) {
                        resolve(null);
                        return;
                    }
                    // Make sure it is the webOS second screen service.
                    if (!(typeMap[type] in headers) ||
                        headers[typeMap[type]] !== "urn:lge-com:service:webos-second-screen:1") {
                        resolve(null);
                        return;
                    }
                    // Get the IP address associated with the TV.
                    if (!("address" in rinfo)) {
                        resolve(null);
                        return;
                    }
                    tv.ip = rinfo.address;
                    tv.url = `ws://${tv.ip}:3000`;
                    resolve(tv);
                });
            }

            function addToTvFromDescription(tv) {
                return new Promise((resolve, reject) => {
                    if (tv === null) {
                        resolve(null);
                        return;
                    }

                    /*
                     * Get the device description. I use this to make sure that this is an
                     * LG Electronics webOS TV as well as to obtain the TV's friendly name
                     * and Unique Device Name (UDN).
                     */
                    if (!("LOCATION" in headers)) {
                        resolve(null);
                        return;
                    }
                    http.get(headers.LOCATION).then((descriptionXml) => {
                        xml2js(descriptionXml.data, (error, description) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            if (!description) {
                                resolve(null);
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
                                resolve(null);
                            }

                            /*
                             * Make sure this is from LG Electronics and has both a friendly
                             * name and a UDN.
                             */
                            if (!description.root.device[0].manufacturer[0].match(/^LG Electronics$/i) ||
                                description.root.device[0].friendlyName[0] === "" ||
                                description.root.device[0].UDN[0] === "") {
                                resolve(null);
                            }
                            tv.name = description.root.device[0].friendlyName;
                            tv.udn = description.root.device[0].UDN;
                            resolve(tv);
                        });
                    });
                });
            }

            /*
             * Get the mac address needed to turn on the TV using wake on
             * lan.
             */
            function addToTvFromMAC(tv) {
                return new Promise((resolve, reject) => {
                    if (tv === null) {
                        resolve(null);
                        return;
                    }
                    arp.getMAC(tv.ip, (err, mac) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        tv.mac = mac;
                        resolve(tv);
                    });
                });
            }
        }
    }

    initialize() {
        return new Promise((resolve) => {
            if (!this.private.initialized) {
                this.private.ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
                this.private.initialized = true;
            }
            resolve();
        });
    }
}

module.exports = LGTVSearcher;