const LGTV = require("lgtv2");
const SSDPClient = require("node-ssdp").Client;
const wol = require("wol");
const EventEmitter = require("events");
const {UnititializedClassError} = require("../common");
const {callbackToPromise} = require("../common");

class LGTVControl extends EventEmitter {
    constructor(db, tv) {
        super();
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.initializing = false;
        that.private.db = db;
        that.private.connecting = false;
        that.private.powerOn = false;
        that.private.tv = {};
        that.private.tv.udn = tv.udn;
        that.private.tv.name = tv.name;
        that.private.tv.ip = tv.ip;
        that.private.tv.url = tv.url;
        that.private.tv.mac = tv.mac;

        function saveKey(key, callback) {
            that.private.db.updateRecord(
                {"udn": that.private.tv.udn},
                {"$set": {"key": key}}
            ).
            catch((error) => {
                callback(error);
                // eslint-disable-next-line no-useless-return
                return;
            });
        }

        that.private.connection = new LGTV({
            "url": that.private.tv.url,
            "timeout": 10000,
            "reconnect": 0,
            "clientKey": tv.key,
            "saveKey": saveKey
        });
        that.private.connection.on("error", (error) => {
            that.private.connecting = false;
            if (error) {
                if (error.code !== "EHOSTUNREACH") {
                    that.emit("error", error);
                }
            }
        });
        // eslint-disable-next-line no-unused-vars
        that.private.connection.on("connecting", (_host) => {
            that.private.connecting = true;
        });
        that.private.connection.on("connect", () => {
            that.private.connecting = false;
            that.private.powerOn = true;
        });
        that.private.connection.on("close", () => {
            that.private.connecting = false;
        });
        that.private.ssdp = new SSDPClient({"sourcePort": "1900"});
        that.private.ssdp.start();
        // eslint-disable-next-line no-unused-vars
        that.private.ssdp.on("advertise-alive", (headers, _rinfo) => {
            if (headers.USN === `${that.private.tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
                that.private.powerOn = true;
                if (that.private.connecting === false) {
                    that.private.connection.connect(that.private.tv.url);
                }
            }
        });
        // eslint-disable-next-line no-unused-vars
        that.private.ssdp.on("advertise-bye", (headers, _rinfo) => {
            if (headers.USN === `${that.private.tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
                that.private.powerOn = false;
                that.private.connection.disconnect();
            }
        });
        that.private.initialized = true;
        that.private.initializing = false;
    }

    turnOff() {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVControl", "turnOff"));
                return;
            }
            const command = {
                "uri": "ssap://system/turnOff"
            };
            // eslint-disable-next-line no-unused-vars
            that.private.connection.request(command.uri);
            that.private.powerOn = false;
            resolve();
        });
    }

    turnOn() {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVControl", "turnOn"));
                return;
            }

            let finished = false;
            let finishing = false;

            let ssdpNotify = new SSDPClient({"sourcePort": "1900"});
            ssdpNotify.on("advertise-alive", ssdpHandler);

            let ssdpResponse = new SSDPClient();
            ssdpResponse.on("response", ssdpHandler);

            ssdpNotify.start();
            setImmediate(wolHandler);
            setImmediate(searchHandler);
            setTimeout(finish, 5000);

            function wolHandler() {
                const {mac} = that.private.tv;
                // eslint-disable-next-line no-unused-vars
                wol.wake(mac, (error, response) => {
                    if (finished === false) {
                        setTimeout(wolHandler, 250);
                    }
                });
            }

            function searchHandler() {
                if (finished === false && ssdpResponse !== null) {
                    ssdpResponse.search(that.private.tv.udn);
                    setTimeout(searchHandler, 1000);
                }
            }

            // eslint-disable-next-line no-unused-vars
            function ssdpHandler(headers, rinfo) {
                if (headers.USN.startsWith(`${that.private.tv.udn}::`) === true &&
                    (Reflect.has(headers, "NTS") === false || headers.NTS === "ssdp:alive")) {
                        that.private.powerOn = true;
                    if (finished === false) {
                        finish();
                    }
                }
            }

            function finish() {
                if (finishing === true) {
                    return;
                }
                finishing = true;
                if (finished === true) {
                    finishing = false;
                    return;
                }

                if (ssdpNotify !== null) {
                    ssdpNotify.removeAllListeners();
                    ssdpNotify = null;
                }
                if (ssdpResponse !== null) {
                    ssdpResponse.removeAllListeners();
                    ssdpResponse = null;
                }

                if (finished === false) {
                    finished = true;
                    finishing = false;
                    resolve({});
                }
            }
        });
    }

    getPowerState() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVControl", "getPowerState");
        }
        return that.private.powerOn
            ? "ON"
            : "OFF";
    }

    lgtvCommand(command) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVControl", "lgtvCommand"));
                return;
            }
            if (command.payload === null) {
                that.private.connection.request(
                    command.uri,
                    (error, response) => callbackToPromise(resolve, reject, error, response)
                );
            } else {
                that.private.connection.request(
                    command.uri,
                    command.payload,
                    (error, response) => callbackToPromise(resolve, reject, error, response)
                );
            }
        });
    }
}

module.exports = LGTVControl;