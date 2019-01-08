const LGTV = require("lgtv2");
const LGTVMessage = require("./lgtv-message.js");
const SSDPClient = require("node-ssdp").Client;
const wol = require("wol");
const EventEmitter = require("events");
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
            let index = 0;
            for (index = 0; index < docs.length; index += 1) {
                if (!(docs[index].udn in that.private.controls)) {
                    that.private.controls[docs[index].udn] = new LGTVControlOne(that.private.db, docs[index]);
                    eventsAdd(docs[index].udn);
                }
            }
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

    skillCommand(event, callback) {
        smartHomeSkill.handler(this, event, (error, response) => callback(error, response));
    }

    turnOff(udn, callback) {
        if (!Reflect.has(this.private.controls, udn)) {
            callback(new Error("Requested TV not found."), null);
            return;
        }
        this.private.controls[udn].turnOff((error, response) => callback(error, response));
    }

    turnOn(udn, callback) {
        if (!Reflect.has(this.private.controls, udn)) {
            callback(new Error("Requested TV not found."), null);
            return;
        }
        this.private.controls[udn].turnOn((error, response) => callback(error, response));
    }

    getPowerState(udn) {
        if (!Reflect.has(this.private.controls, udn)) {
            throw new Error("Requested TV not found.");
        }
        return this.private.controls[udn].getPowerState(udn);
    }

    tvCommand(udn, command, callback) {
        if (!Reflect.has(this.private.controls, udn)) {
            callback(new Error("Requested TV not found."), null);
            return;
        }
        const translation = LGTVMessage.translate(command);
        this.private.controls[udn].lgtvCommand(translation, (error, response) => callback(error, response));
    }

    lgtvCommand(udn, command, callback) {
        if (!Reflect.has(this.private.controls, udn)) {
            callback(new Error("Requested TV not found."), null);
            return;
        }
        this.private.controls[udn].lgtvCommand(command, (error, response) => callback(error, response));
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

    turnOff(callback) {
        const command = {
            "uri": "ssap://system/turnOff"
        };
        // eslint-disable-next-line no-unused-vars
        this.private.connection.request(command.uri);
        this.private.powerOn = false;
        callback(null, null);
    }

    turnOn(callback) {
        let done = false;
        let callbackCalled = false;

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
                if (callbackCalled === false) {
                    callbackCalled = true;
                    // eslint-disable-next-line callback-return
                    callback(null, {});
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
            if (callbackCalled === false) {
                callbackCalled = true;
                // eslint-disable-next-line callback-return
                callback(null, {});
            }
        }
        setTimeout(cleanup, 5000);
    }

    getPowerState() {
        return this.private.powerOn
            ? "ON"
            : "OFF";
    }

    lgtvCommand(command, callback) {
        if (command.payload === null) {
            this.private.connection.request(
                command.uri,
                (error, response) => callback(error, response)
            );
        } else {
            this.private.connection.request(
                command.uri,
                command.payload,
                (error, response) => callback(error, response)
            );
        }
    }
}

module.exports = LGTVControl;