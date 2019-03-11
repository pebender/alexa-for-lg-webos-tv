const EventEmitter = require("events");
const {Mutex} = require("async-mutex");
const {UnititializedClassError} = require("alexa-lg-webos-tv-common");
const BackendController = require("./backend-controller");
const BackendSearcher = require("./backend-searcher");

class Backend extends EventEmitter {
    constructor(db) {
        super();

        this.private = {};
        this.private.initialized = false;
        this.private.initializeMutex = new Mutex();
        this.private.controller = new BackendController(db);
        this.private.searcher = new BackendSearcher();

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("Backend", methodName);
            }
        };
    }

    initialize() {
        const that = this;
        return that.private.initializeMutex.runExclusive(() => new Promise(async (resolve) => {
            if (that.private.initialized === true) {
                resolve();
                return;
            }

            that.private.controller.on("error", (error, id) => {
                that.emit("error", error, `BackendController.${id}`);
            });
            await that.private.controller.initialize();
            that.private.searcher.on("error", (error) => {
                that.emit("error", error, "BackendController");
            });
            that.private.searcher.on("found", (tv) => {
                that.private.controller.tvUpsert(tv);
            });
            await that.private.searcher.initialize();
            that.private.initialized = true;
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