const EventEmitter = require("events");
const {GenericError, UnititializedClassError} = require("../common");
const LGTVMessage = require("../lgtv-message");
const smartHomeSkill = require("../smart-home/index");
const LGTVControl = require("./lgtv-control");

class LGTVController extends EventEmitter {
    constructor (db) {
        super();
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.initializing = false;
        that.private.db = db;
        that.private.controls = [];
    }

    get db() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "db");
        }

        return that.private.db;
    }

    initialize(callback) {
        if (this.private.initializing === true) {
            callback(null, null);
            return;
        }
        this.private.initializing = true;

        const that = this;
        if (that.private.initialized === true) {
            that.private.initializing = false;
            callback(null, null);
            return;
        }

        that.private.db.db.find({}, (error, docs) => {
            if (error) {
                that.private.initialized = false;
                that.private.initializing = false;
                callback(error, null);
                return;
            }
            docs.forEach((doc) => {
                if (Reflect.has(that.private.controls, doc.udn) === false) {
                    that.private.controls[doc.udn] = new LGTVControl(that.private.db, doc);
                    eventsAdd(doc.udn);
                }
            });
            that.private.initialized = true;
            that.private.initializing = true;
            callback(null, null);
        });

        function eventsAdd(udn) {
            that.private.controls[udn].on("error", (error) => {
                that.emit("error", error, udn);
            });
        }
    }

    tvUpsert(tv) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "tvUpsert");
        }

        that.private.db.db.findOne({"$and": [
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
                if (Reflect.has(that.private.controls, tv.udn) === true) {
                    Reflect.deleteProperty(that.private.controls, tv.udn);
                }
                that.private.db.db.update(
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
                        if (Reflect.has(that.private.controls, tv.udn) === false) {
                            that.private.controls[tv.udn] = new LGTVControl(that.private.db, tv);
                            eventsAdd(tv.udn);
                        }
                    }
                );
            } else {
                // eslint-disable-next-line no-lonely-if
                if (Reflect.has(that.private.controls, doc.udn) === false) {
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
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "skillCommand");
        }
        return smartHomeSkill.handler(that, event);
    }

    turnOff(udn) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVController", "turnOff"));
                return;
            }
            if (Reflect.has(that.private.controls, udn) === false) {
                reject(new UnknownTVError(udn, "LGTVController", "turnOff"));
                return;
            }
            resolve(that.private.controls[udn].turnOff());
        });
    }

    turnOn(udn) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVController", "turnOn"));
                return;
            }
            if (Reflect.has(that.private.controls, udn) === false) {
                reject(new UnknownTVError(udn, "LGTVController", "turnOn"));
                return;
            }
            resolve(that.private.controls[udn].turnOn());
        });
    }

    getPowerState(udn) {
        const that = this;

        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "getPowerState");
        }
        if (Reflect.has(that.private.controls, udn) === false) {
            throw new UnknownTVError(udn, "LGTVController", "getPowerState");
        }
        return that.private.controls[udn].getPowerState();
    }

    tvCommand(udn, command) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVController", "tvCommand"));
                return;
            }
            if (Reflect.has(that.private.controls, udn) === false) {
                reject(new UnknownTVError(udn, "LGTVController", "tvCommand"));
                return;
            }
            resolve(that.private.controls[udn].lgtvCommand(LGTVMessage.translate(command)));
        });
    }

    lgtvCommand(udn, command) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVController", "tvCommand"));
                return;
            }
            if (Reflect.has(that.private.controls, udn) === false) {
                reject(new UnknownTVError(udn, "LGTVController", "lgtvCommand"));
                return;
            }
            resolve(that.private.controls[udn].lgtvCommand(command));
        });
    }
}

class UnknownTVError extends GenericError {
    constructor(udn, className, methodName) {
        super();
        const that = this;

        that.name = "UnknownTVError";
        that.message = `the requested television '${udn}' is not known in '${className}.${methodName}'`;
    }
}

module.exports = LGTVController;