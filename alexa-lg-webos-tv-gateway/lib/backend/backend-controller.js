const EventEmitter = require("events");
const {Mutex} = require("async-mutex");
const {GenericError, UnititializedClassError} = require("../common");
const customSkill = require("./custom-skill");
const smartHomeSkill = require("./smart-home-skill");
const BackendControl = require("./backend-control");

const mutex = new Mutex();

class BackendController extends EventEmitter {
    constructor (db) {
        super();
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.db = db;
        that.private.controls = [];

        that.private.rejectIfNotInitialized = (methodName) => new Promise((resolve, reject) => {
            if (this.private.initialized === false) {
                reject(new UnititializedClassError("BackendController", methodName));
                return;
            }
            resolve();
        });

        that.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("BackendController", methodName);
            }
        };

        that.private.rejectIfNotKnownTV = (methodName, udn) => new Promise((resolve, reject) => {
            if (Reflect.has(this.private.controls, udn) === false) {
                reject(new GenericError(
                    "UnknownTVError",
                    `the requested television '${udn}' is not known in 'BackendController.${methodName}'`
                ));
                return;
            }
            resolve();
        });

        that.private.throwIfNotKnownTV = (methodName, udn) => {
            if (Reflect.has(this.private.controls, udn) === false) {
                throw new GenericError(
                    "UnknownTVError",
                    `the requested television '${udn}' is not known in 'BackendController.${methodName}'`
                );
            }
        };
    }

    initialize() {
        const that = this;
        return mutex.runExclusive(initializeHandler);
        function initializeHandler() {
            return new Promise((resolve, reject) => {
                if (that.private.initialized === true) {
                    resolve();
                    return;
                }

                that.private.db.getRecords({}).
                then(async (records) => {
                    await records.forEach((record) => {
                        if (Reflect.has(that.private.controls, record.udn) === false) {
                            that.private.controls[record.udn] = new BackendControl(that.private.db, record);
                            that.private.controls[record.udn].initialize().catch(reject);
                            eventsAdd(record.udn);
                        }
                    });
                    function eventsAdd(udn) {
                        that.private.controls[udn].on("error", (error) => {
                            that.emit("error", error, udn);
                        });
                    }
                    that.private.initialized = true;
                    resolve();
                }).
                catch(reject);
            });
        }
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
                that.private.controls[tv.udn] = new BackendControl(that.private.db, tvUpdatedOrInserted);
                that.private.controls[tv.udn].initialize();
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
        this.private.throwIfNotInitialized("tv");
        this.private.throwIfNotKnownTV("tv", udn);
        return this.private.controls[udn].tv;
    }

    turnOff(udn) {
        return this.private.rejectIfNotInitialized("turnOff").
            then(() => this.private.rejectIfNotKnownTV("turnOff", udn)).
            then(() => this.private.controls[udn].turnOff());
    }

    turnOn(udn) {
        return this.private.rejectIfNotInitialized().
            then(() => this.private.controls[udn].turnOn());
    }

    getPowerState(udn) {
        this.private.throwIfNotInitialized("getPowerState");
        this.private.throwIfNotKnownTV("getPowerState", udn);
        return this.private.controls[udn].getPowerState();
    }

    lgtvCommand(udn, command) {
        return this.private.rejectIfNotInitialized("lgtvCommand").
            then(() => this.private.rejectIfNotKnownTV("lgtvCommand", udn)).
            then(() => this.private.controls[udn].lgtvCommand(command));
    }
}

module.exports = BackendController;