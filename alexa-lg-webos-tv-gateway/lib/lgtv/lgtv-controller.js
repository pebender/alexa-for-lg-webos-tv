const EventEmitter = require("events");
const {GenericError, UnititializedClassError} = require("../common");
const customSkill = require("./custom-skill");
const smartHomeSkill = require("./smart-home-skill");
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

    initialize() {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initializing === true) {
                resolve();
                return;
            }
            that.private.initializing = true;

            if (that.private.initialized === true) {
                that.private.initializing = false;
                resolve();
                return;
            }

            that.private.db.getRecords({}).
            then((records) => {
                records.forEach((record) => {
                    if (Reflect.has(that.private.controls, record.udn) === false) {
                        that.private.controls[record.udn] = new LGTVControl(that.private.db, record);
                        eventsAdd(record.udn);
                    }
                });
                function eventsAdd(udn) {
                    that.private.controls[udn].on("error", (error) => {
                        that.emit("error", error, udn);
                    });
                }
                that.private.initialized = true;
                that.private.initializing = true;
                resolve();
            }).
            catch((error) => {
                that.private.initialized = false;
                that.private.initializing = false;
                reject(error);
            });
        });
    }

    tvUpsert(tv) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "tvUpsert");
        }

        that.private.db.getRecord({"$and": [
            {"udn": tv.udn},
            {"name": tv.name},
            {"ip": tv.ip},
            {"url": tv.url},
            {"mac": tv.mac}
        ]}).
        then((record) => {
            if (record === null) {
                if (Reflect.has(that.private.controls, tv.udn) === true) {
                    Reflect.deleteProperty(that.private.controls, tv.udn);
                }
                return that.private.db.updateOrInsertRecord(
                    {"udn": tv.udn},
                    {
                        "udn": tv.udn,
                        "name": tv.name,
                        "ip": tv.ip,
                        "url": tv.url,
                        "mac": tv.mac,
                        "key": ""
                    }
                ).
                then(() => tv);
            }
            return record;
        }).
        then((tvUpdatedOrInserted) => {
            if (Reflect.has(that.private.controls, tv.udn) === false) {
                that.private.controls[tv.udn] = new LGTVControl(that.private.db, tvUpdatedOrInserted);
                eventsAdd(tv.udn);
            }
            function eventsAdd(udn) {
                that.private.controls[udn].on("error", (error) => {
                    that.emit("error", error, udn);
                });
            }
        }).
        catch((error) => {
            that.emit("error", error, tv.udn);
        });
    }

    runCommand(event) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "runCommand");
        }
        return customSkill.handler(that, event);
    }

    skillCommand(event) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "skillCommand");
        }
        return smartHomeSkill.handler(that, event);
    }

    getUDNList() {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVController", "getUDNList"));
            }
            resolve(Object.keys(this.private.controls));
        });
    }

    tv(udn) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "tv");
        }
        if (Reflect.has(that.private.controls, udn) === false) {
            throw new UnknownTVError(udn, "LGTVController", "tv");
        }
        return that.private.controls[udn].tv;
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

    lgtvCommand(udn, command) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVController", "lgtvCommand"));
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