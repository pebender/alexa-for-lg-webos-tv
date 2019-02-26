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
            if (headers.USN.startsWith(`${that.private.tv.udn}::`) &&
                headers.NT === "urn:lge-com:service:webos-second-screen:1") {
                that.private.powerOn = true;
                if (that.private.connecting === false) {
                    that.private.connection.connect(that.private.tv.url);
                }
            }
        });
        // eslint-disable-next-line no-unused-vars
        that.private.ssdp.on("advertise-bye", (headers, _rinfo) => {
            if (headers.USN.startsWith(`${that.private.tv.udn}::`) &&
                headers.NT === "urn:lge-com:service:webos-second-screen:1") {
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

            let done = false;
            let resolved = false;

            const {mac} = that.private.tv;

            function wolHandler() {
                // eslint-disable-next-line no-unused-vars
                wol.wake(mac, (error, response) => {
                    if (done === false) {
                        setTimeout(wolHandler, 250);
                    }
                });
            }
            setImmediate(wolHandler);

            let ssdp = new SSDPClient();
            // eslint-disable-next-line no-unused-vars
            ssdp.on("response", (headers, rinfo) => {
                if (headers.USN.startsWith(`${that.private.tv.udn}::`) &&
                    headers.ST === "urn:lge-com:service:webos-second-screen:1") {
                    that.private.powerOn = true;
                    if (resolved === false) {
                        resolved = true;
                        resolve({});
                    }
                }
            });
            ssdp.search("urn:lge-com:service:webos-second-screen:1");
            function cleanup() {
                done = true;
                if (ssdp) {
                    ssdp.removeAllListeners();
                    ssdp = null;
                }
                if (resolved === false) {
                    resolved = true;
                }
            }
            setTimeout(cleanup, 5000);
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