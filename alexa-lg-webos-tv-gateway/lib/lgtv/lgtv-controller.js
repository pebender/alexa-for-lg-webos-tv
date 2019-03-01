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

        that.private.rejectIfNotInitialized = (methodName) => new Promise((resolve, reject) => {
            if (this.private.initialized === false) {
                reject(new UnititializedClassError("LGTVController", methodName));
                return;
            }
            resolve();
        });

        that.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("LGTVController", methodName);
            }
        };

        that.private.rejectIfNotKnownTV = (methodName, udn) => new Promise((resolve, reject) => {
            if (Reflect.has(this.private.controls, udn) === false) {
                reject(new GenericError(
                    "UnknownTVError",
                    `the requested television '${udn}' is not known in 'LGTVController.${methodName}'`
                ));
                return;
            }
            resolve();
        });

        that.private.throwIfNotKnownTV = (methodName, udn) => {
            if (Reflect.has(this.private.controls, udn) === false) {
                throw new GenericError(
                    "UnknownTVError",
                    `the requested television '${udn}' is not known in 'LGTVController.${methodName}'`
                );
            }
        };
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

        that.private.throwIfNotInitialized("tvUpsert");

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
        return this.private.throwIfNotInitialized("runCommand").
            then(() => customSkill.handler(this, event));
    }

    skillCommand(event) {
        return this.private.rejectIfNotInitialized("skillCommand").
            then(() => smartHomeSkill.handler(this, event));
    }

    getUDNList() {
        return this.private.rejectIfNotInitialized("getUDNList").
            then(() => Object.keys(this.private.controls));
    }

    tv(udn) {
        this.private.throwIfNotInitialized("skillCommand");
        this.private.throwIfNotKnownTV("skillCommand", udn);
        return this.private.controls[udn].tv;
    }

    turnOff(udn) {
        return this.private.rejectIfNotInitialized("getPowerState").
            then(() => this.private.rejectIfNotKnownTV("getPowerState", udn)).
            then(() => this.private.controls[udn].turnOff());
    }

    turnOn(udn) {
        return this.private.rejectIfNotInitialized().
            then(() => this.private.controls[udn].turnOn());
    }

    getPowerState(udn) {
        this.private.throwIfNotInitialized("skillCommand");
        this.private.throwIfNotKnownTV("skillCommand", udn);
        return this.private.controls[udn].getPowerState();
    }

    lgtvCommand(udn, command) {
        return this.private.rejectIfNotInitialized("getPowerState").
            then(() => this.private.rejectIfNotKnownTV("getPowerState", udn)).
            then(() => this.private.controls[udn].lgtvCommand(command));
    }
}

module.exports = LGTVController;