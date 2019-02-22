const LGTV = require("lgtv2");
const LGTVMessage = require("./lgtv-message.js");
const SSDPClient = require("node-ssdp").Client;
const wol = require("wol");
const EventEmitter = require("events");
const {callbackToPromise} = require("./common");
const smartHomeSkill = require("./smart-home/index.js");

class LGTVControl extends EventEmitter {
    constructor (db) {

        super();

        this.private = {};
        this.private.controls = [];
        if (typeof db === "undefined" || db === null) {
            return;
        }
        this.private.db = db;
    }

    getDb() {
        return this.private.db;
    }

    dbLoad() {
        const that = this;
        this.private.db.find({}, (error, docs) => {
            if (error) {
                that.emit("error", error);
                return;
            }
            docs.forEach((doc) => {
                if (!(doc.udn in that.private.controls)) {
                    that.private.controls[doc.udn] = new LGTVControlOne(that.private.db, doc);
                    eventsAdd(doc.udn);
                }
            });
        });

        function eventsAdd(udn) {
            that.private.controls[udn].on("error", (error) => {
                that.emit("error", error, udn);
            });
        }
    }

    tvUpsert(tv) {
        const that = this;
        that.private.db.findOne({"$and": [
            {"udn": tv.udn},
            {"name": tv.name},
            {"ip": tv.ip},
            {"url": tv.url},
            {"mac": tv.mac}
        ]}, (error, doc) => {
            if (error) {
                that.emit("error", error, tv.udn);
                return;
            }
            if (doc === null) {
                if (Reflect.has(that.private.controls, tv.udn)) {
                    Reflect.deleteProperty(that.private.controls, tv.udn);
                }
                that.private.db.update(
                    {"udn": tv.udn},
                    {
                        "udn": tv.udn,
                        "name": tv.name,
                        "ip": tv.ip,
                        "url": tv.url,
                        "mac": tv.mac,
                        "key": ""
                    },
                    {"upsert": true},
                    // eslint-disable-next-line no-unused-vars
                    (err, _numAffectedDocs, _affectedDocs, _upsert) => {
                        if (err) {
                            that.emit("error", err, tv.udn);
                            return;
                        }
                        if (!Reflect.has(that.private.controls, tv.udn)) {
                            that.private.controls[tv.udn] = new LGTVControlOne(that.private.db, tv);
                            eventsAdd(tv.udn);
                        }
                    }
                );
            } else {
                // eslint-disable-next-line no-lonely-if
                if (!Reflect.has(that.private.controls, doc.udn)) {
                    that.private.controls[doc.udn] = new LGTVControlOne(that.private.db, doc);
                    eventsAdd(doc.udn);
                }
            }
        });
        function eventsAdd(udn) {
            that.private.controls[udn].on("error", (error) => {
                that.emit("error", error, udn);
            });
        }
    }

    skillCommand(event) {
        return smartHomeSkill.handler(this, event);
    }

    turnOff(udn) {
        return new Promise((resolve, reject) => {
            if (!Reflect.has(this.private.controls, udn)) {
                reject(new Error("Requested TV not found."));
                return;
            }
            resolve(this.private.controls[udn].turnOff());
        });
    }

    turnOn(udn) {
        return new Promise((resolve, reject) => {
            if (!Reflect.has(this.private.controls, udn)) {
                reject(new Error("Requested TV not found."));
                return;
            }
            resolve(this.private.controls[udn].turnOn());
        });
    }

    getPowerState(udn) {
        if (!Reflect.has(this.private.controls, udn)) {
            throw new Error("Requested TV not found.");
        }
        return this.private.controls[udn].getPowerState(udn);
    }

    tvCommand(udn, command) {
        return new Promise((resolve) => {
            if (!Reflect.has(this.private.controls, udn)) {
                resolve(new Error("Requested TV not found."));
                return;
            }
            const translation = LGTVMessage.translate(command);
            resolve(this.private.controls[udn].lgtvCommand(translation));
        });
    }

    lgtvCommand(udn, command) {
        return new Promise((resolve, reject) => {
            if (!Reflect.has(this.private.controls, udn)) {
                reject(new Error("Requested TV not found."), null);
                return;
            }
            resolve(this.private.controls[udn].lgtvCommand(command));
        });
    }
}

class LGTVControlOne extends EventEmitter {
    constructor(db, tv) {

        super();

        this.private = {};
        this.private.db = db;
        this.private.connecting = false;
        this.private.powerOn = false;
        this.private.tv = {};
        this.private.tv.udn = tv.udn;
        this.private.tv.name = tv.name;
        this.private.tv.ip = tv.ip;
        this.private.tv.url = tv.url;
        this.private.tv.mac = tv.mac;

        const saveKey = (key, callback) => {
            this.private.db.update(
                {"udn": this.private.tv.udn},
                {"$set": {"key": key}},
                // eslint-disable-next-line no-unused-vars
                (err, _numAffected, _affectedDocuments, _upsert) => {
                    if (err) {
                        callback(err);
                        return null;
                    }
                    return null;
                }
            );
        };
        this.private.connection = new LGTV({
            "url": this.private.tv.url,
            "timeout": 10000,
            "reconnect": 0,
            "clientKey": tv.key,
            "saveKey": saveKey
        });
        this.private.connection.on("error", (error) => {
            this.private.connecting = false;
            if (error) {
                if (error.code !== "EHOSTUNREACH") {
                    this.emit("error", error);
                }
            }
        });
        // eslint-disable-next-line no-unused-vars
        this.private.connection.on("connecting", (_host) => {
            this.private.connecting = true;
        });
        this.private.connection.on("connect", () => {
            this.private.connecting = false;
            this.private.powerOn = true;
        });
        this.private.connection.on("close", () => {
            this.private.connecting = false;
        });
        this.private.ssdp = new SSDPClient({"sourcePort": "1900"});
        this.private.ssdp.start();
        // eslint-disable-next-line no-unused-vars
        this.private.ssdp.on("advertise-alive", (headers, _rinfo) => {
            if (headers.USN.startsWith(`${this.private.tv.udn}::`) &&
                headers.NT === "urn:lge-com:service:webos-second-screen:1") {
                this.private.powerOn = true;
                if (this.private.connecting === false) {
                    this.private.connection.connect(this.private.tv.url);
                }
            }
        });
        // eslint-disable-next-line no-unused-vars
        this.private.ssdp.on("advertise-bye", (headers, _rinfo) => {
            if (headers.USN.startsWith(`${this.private.tv.udn}::`) &&
                headers.NT === "urn:lge-com:service:webos-second-screen:1") {
                this.private.powerOn = false;
                this.private.connection.disconnect();
            }
        });
    }

    turnOff() {
        return new Promise((resolve) => {
            const command = {
                "uri": "ssap://system/turnOff"
            };
            // eslint-disable-next-line no-unused-vars
            this.private.connection.request(command.uri);
            this.private.powerOn = false;
            resolve();
        });
    }

    turnOn() {
        return new Promise((resolve) => {

            let done = false;
            let resolved = false;

            const {mac} = this.private.tv;

            function wolHandler() {
                // eslint-disable-next-line no-unused-vars
                wol.wake(mac, (error, response) => {
                    if (done === false) {
                        setTimeout(wolHandler, 250);
                    }
                });
            }
            setImmediate(wolHandler);

            // eslint-disable-next-line no-unused-vars

            let ssdp = new SSDPClient();
            // eslint-disable-next-line no-unused-vars
            ssdp.on("response", (headers, rinfo) => {
                if (headers.USN.startsWith(`${this.private.tv.udn}::`) &&
                    headers.ST === "urn:lge-com:service:webos-second-screen:1") {
                    this.private.powerOn = true;
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
        return this.private.powerOn
            ? "ON"
            : "OFF";
    }

    lgtvCommand(command) {
        return new Promise((resolve, reject) => {
            if (command.payload === null) {
                this.private.connection.request(
                    command.uri,
                    (error, response) => callbackToPromise(resolve, reject, error, response)
                );
            } else {
                this.private.connection.request(
                    command.uri,
                    command.payload,
                    (error, response) => callbackToPromise(resolve, reject, error, response)
                );
            }
        });
    }
}

module.exports = LGTVControl;