const EventEmitter = require("events");
const {Mutex} = require("async-mutex");
const {UnititializedClassError} = require("../common");
const BackendController = require("./backend-controller");
const BackendSearcher = require("./backend-searcher");

const mutex = new Mutex();

class Backend extends EventEmitter {
    constructor(db) {
        super();

        this.private = {};
        this.private.initialized = false;
        this.private.controller = new BackendController(db);
        this.private.searcher = new BackendSearcher();

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("Backend", methodName);
            }
        };
    }

    initialize() {
        return mutex.runExclusive(() => new Promise(async (resolve) => {
            if (this.private.initialized === true) {
                resolve();
                return;
            }

            this.private.controller.on("error", (error, id) => {
                this.emit("error", error, `BackendController.${id}`);
            });
            await this.private.controller.initialize();
            this.private.searcher.on("error", (error) => {
                this.emit("error", error, "BackendController");
            });
            this.private.searcher.on("found", (tv) => {
                this.private.controller.tvUpsert(tv);
            });
            await this.private.searcher.initialize();
            this.private.initialized = true;
            resolve();
        }));
    }

    start() {
        this.private.throwIfNotInitialized("start");
        return this.private.searcher.now();
    }

    runCommand(event) {
        this.private.throwIfNotInitialized("runCommand");
        return this.private.controller.runCommand(event);
    }

    skillCommand(event) {
        this.private.throwIfNotInitialized("skillCommand");
        return this.private.controller.skillCommand(event);
    }

    getUDNList() {
        this.private.throwIfNotInitialized("getUDNList");
        return this.private.controller.getUDNList();
    }

    tv(udn) {
        this.private.throwIfNotInitialized("tv");
        return this.private.controller.tv(udn);
    }

    lgtvCommand(udn, command) {
        this.private.throwIfNotInitialized("lgtvCommand");
        return this.private.controller.lgtvCommand(udn, command);
    }

    getPowerState(udn) {
        this.private.throwIfNotInitialized("getPowerState");
        return this.private.controller.getPowerState(udn);
    }

    turnOff(udn) {
        this.private.throwIfNotInitialized("turnOff");
        return this.private.controller.turnOff(udn);
    }

    turnOn(udn) {
        this.private.throwIfNotInitialized("turnOn");
        return this.private.controller.turnOn(udn);
    }
}

module.exports = Backend;