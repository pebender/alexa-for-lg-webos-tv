const EventEmitter = require("events");
const customSkill = require("./custom");
const smartHomeSkill = require("./smart-home");
const LGTVControl = require("./lgtv-control");

class LGTVController extends EventEmitter {
    constructor (db) {

        super();

        this.private = {};
        this.private.initialized = false;
        this.private.controls = [];
        if (typeof db === "undefined" || db === null) {
            return;
        }
        this.private.db = db;
    }

    getDb() {
        return this.private.db;
    }

    initialize() {
        const that = this;
        return new Promise((resolve) => {
            if (!this.private.initialized) {
                this.private.db.find({}, (error, docs) => {
                    if (error) {
                        that.emit("error", error);
                        resolve();
                    }
                    docs.forEach((doc) => {
                        if (!(doc.udn in that.private.controls)) {
                            that.private.controls[doc.udn] = new LGTVControl(that.private.db, doc);
                            eventsAdd(doc.udn);
                        }
                    });
                });
                this.private.initialized = true;
            }
            resolve();
        });

        function eventsAdd(udn) {
            that.private.controls[udn].on("error", (error) => {
                that.emit("error", error, udn);
            });
        }
    }

    tvUpsert(tv) {
        const that = this;
        return checkDatabase().
            then(addToDatabase).
            then(addControl);

        function checkDatabase() {
            return new Promise((resolve, reject) => {
                that.private.db.findOne({"$and": [
                    {"udn": tv.udn},
                    {"name": tv.name},
                    {"ip": tv.ip},
                    {"url": tv.url},
                    {"mac": tv.mac}
                ]}, (error, doc) => {
                    if (error) {
                        that.emit("error", error, tv.udn);
                        reject(error);
                        return;
                    }
                    resolve(doc);
                });
            });
        }

        function addToDatabase(doc) {
            return new Promise((resolve, reject) => {
                if (doc !== null) {
                    resolve(doc);
                }

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
                            reject(err);
                            return;
                        }
                        resolve(tv);
                    }
                );

                resolve(null);
            });
        }

        function addControl(doc) {
            return new Promise((resolve) => {
                if (doc === null) {
                    resolve(null);
                }

                if (!Reflect.has(that.private.controls, doc.udn)) {
                    that.private.controls[doc.udn] = new LGTVControl(that.private.db, doc);
                    that.private.controls[doc.udn].on("error", (error) => {
                        that.emit("error", error, doc.udn);
                    });
                }

                resolve(doc);
            });
        }
    }

    customSkillCommand(event) {
        return customSkill.handler(this, event);
    }

    smartHomeSkillCommand(event) {
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