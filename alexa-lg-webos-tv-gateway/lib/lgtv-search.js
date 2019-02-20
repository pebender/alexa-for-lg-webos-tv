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

class LGTVSearch extends EventEmitter {
    constructor() {

        super();

        const that = this;

        this.ssdpNotify = new SSDPClient({"sourcePort": "1900"});
        this.ssdpResponse = new SSDPClient();
        this.ssdpNotify.start();
        this.ssdpNotify.on("advertise-alive", (headers, rinfo) => {
            ssdpProcess("advertise-alive", headers, rinfo, (error, tv) => {
                if (error) {
                    this.emit("error", error);
                    return error;
                }
                if (!tv) {
                    return null;
                }
                this.emit("found", tv);
                return null;
            });
        });
        this.ssdpNotify.on("advertise-bye", (headers, rinfo) => {
            ssdpProcess("advertise-bye", headers, rinfo, (error, tv) => {
                if (error) {
                    this.emit("error", error);
                    return error;
                }
                if (!tv) {
                    return null;
                }
                this.emit("found", tv);
                return null;
            });
        });
        this.ssdpResponse.on("response", (headers, statusCode, rinfo) => {
            if (statusCode !== "200") {
                return;
            }
            ssdpProcess("response", headers, rinfo, (error, tv) => {
                if (error) {
                    this.emit("error", error);
                    return error;
                }
                if (!tv) {
                    return null;
                }
                this.emit("found", tv);
                return null;
            });
        });
        periodic();

        // Periodicly scan for TVs.
        function periodic() {
            // Search every 1800s as that is the UPnP recommended time.
            that.ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
            setTimeout(periodic, 1800000);
        }

        function ssdpProcess(type, headers, rinfo, callback) {
            const tv = {};
            const typeMap = {
                "advertise-alive": "NT",
                "advertise-bye": "NT",
                "response": "ST"
            };
            if (!(type in typeMap)) {
                callback(null, null);
                return;
            }
            // Make sure it is webOS and UPnP 1.0 or 1.1.
            if (!("SERVER" in headers) ||
                !headers.SERVER.match(/^WebOS\/[\d.]+ UPnP\/1\.[01]$/i)) {
                callback(null, null);
                return;
            }
            // Make sure it is the webOS second screen service.
            if (!(typeMap[type] in headers) ||
                headers[typeMap[type]] !== "urn:lge-com:service:webos-second-screen:1") {
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
                callback(null);
                return;
            }
            http.get(headers.LOCATION).then((descriptionXml) => {
                xml2js(descriptionXml.data, (error, description) => {
                    if (error) {
                        callback(error, null);
                        return error;
                    }
                    if (!description) {
                        callback(null, null);
                        return null;
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
                        return null;
                    }

                    /*
                     * Make sure this is from LG Electronics and has both a friendly
                     * name and a UDN.
                     */
                    if (!description.root.device[0].manufacturer[0].match(/^LG Electronics$/i) ||
                        description.root.device[0].friendlyName[0] === "" ||
                        description.root.device[0].UDN[0] === "") {
                        callback(null, null);
                        return null;
                    }
                    [tv.name] = description.root.device[0].friendlyName;
                    [tv.udn] = description.root.device[0].UDN;

                    /*
                     * Get the mac address needed to turn on the TV using wake on
                     * lan.
                     */
                    arp.getMAC(tv.ip, (err, mac) => {
                        if (err) {
                            callback(err, null);
                            return err;
                        }
                        tv.mac = mac;
                        callback(null, tv);
                        return null;
                    });
                    return null;
                });
            });
        }
    }

    now() {
        this.ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
    }
}

module.exports = LGTVSearch;