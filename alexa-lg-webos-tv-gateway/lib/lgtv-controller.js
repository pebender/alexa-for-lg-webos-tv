const LGTVMessage = require("./lgtv-message.js");
const EventEmitter = require("events");
const smartHomeSkill = require("./smart-home/index.js");
const LGTVControl = require("./lgtv-control.js");

class LGTVController extends EventEmitter {
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
                    that.private.controls[doc.udn] = new LGTVControl(that.private.db, doc);
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
                            that.private.controls[tv.udn] = new LGTVControl(that.private.db, tv);
                            eventsAdd(tv.udn);
                        }
                    }
                );
            } else {
                // eslint-disable-next-line no-lonely-if
                if (!Reflect.has(that.private.controls, doc.udn)) {
                    that.private.controls[doc.udn] = new LGTVControl(that.private.db, doc);
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

module.exports = LGTVController;