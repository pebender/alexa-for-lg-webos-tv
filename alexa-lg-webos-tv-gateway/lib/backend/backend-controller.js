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

        this.private = {};
        this.private.initialized = false;
        this.private.db = db;
        this.private.controls = [];

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("BackendController", methodName);
            }
        };

        this.private.throwIfNotKnownTV = (methodName, udn) => {
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
        return mutex.runExclusive(() => new Promise(async (resolve, reject) => {
            if (this.private.initialized === true) {
                resolve();
                return;
            }

            const records = await this.private.db.getRecords({});
            await records.forEach((record) => {
                if (Reflect.has(this.private.controls, record.udn) === false) {
                    this.private.controls[record.udn] = new BackendControl(this.private.db, record);
                    this.private.controls[record.udn].initialize().catch(reject);
                    eventsAdd(record.udn);
                }
            });
            this.private.initialized = true;
            resolve();
        }));

        function eventsAdd(udn) {
            that.private.controls[udn].on("error", (error) => {
                that.emit("error", error, udn);
            });
        }
    }

    async tvUpsert(tv) {
        const that = this;
        that.private.throwIfNotInitialized("tvUpsert");
        try {
            const record = await this.private.db.getRecord({"$and": [
                {"udn": tv.udn},
                {"name": tv.name},
                {"ip": tv.ip},
                {"url": tv.url},
                {"mac": tv.mac}
            ]});
            if (record === null) {
                if (Reflect.has(this.private.controls, tv.udn) === true) {
                    Reflect.deleteProperty(this.private.controls, tv.udn);
                }
                await this.private.db.updateOrInsertRecord(
                    {"udn": tv.udn},
                    {
                        "udn": tv.udn,
                        "name": tv.name,
                        "ip": tv.ip,
                        "url": tv.url,
                        "mac": tv.mac,
                        "key": ""
                    }
                );
            }
            if (Reflect.has(this.private.controls, tv.udn) === false) {
                this.private.controls[tv.udn] = new BackendControl(this.private.db, tv);
                await this.private.controls[tv.udn].initialize();
                eventsAdd(tv.udn);
            }
        } catch (error) {
            this.emit("error", error, tv.udn);
        }

        function eventsAdd(udn) {
            that.private.controls[udn].on("error", (error) => {
                that.emit("error", error, udn);
            });
        }
    }

    runCommand(event) {
        this.private.throwIfNotInitialized("runCommand");
        return customSkill.handler(this, event);
    }

    skillCommand(event) {
        this.private.throwIfNotInitialized("skillCommand");
        return smartHomeSkill.handler(this, event);
    }

    getUDNList() {
        this.private.throwIfNotInitialized("getUDNList");
        return Object.keys(this.private.controls);
    }

    tv(udn) {
        this.private.throwIfNotInitialized("tv");
        this.private.throwIfNotKnownTV("tv", udn);
        return this.private.controls[udn].tv;
    }

    turnOff(udn) {
        this.private.throwIfNotInitialized("turnOff");
        this.private.throwIfNotKnownTV("turnOff", udn);
        return this.private.controls[udn].turnOff();
    }

    turnOn(udn) {
        this.private.throwIfNotInitialized("turnOn");
        return this.private.controls[udn].turnOn();
    }

    getPowerState(udn) {
        this.private.throwIfNotInitialized("getPowerState");
        this.private.throwIfNotKnownTV("getPowerState", udn);
        return this.private.controls[udn].getPowerState();
    }

    lgtvCommand(udn, command) {
        this.private.throwIfNotInitialized("lgtvCommand");
        this.private.throwIfNotKnownTV("lgtvCommand", udn);
        return this.private.controls[udn].lgtvCommand(command);
    }
}

module.exports = BackendController;