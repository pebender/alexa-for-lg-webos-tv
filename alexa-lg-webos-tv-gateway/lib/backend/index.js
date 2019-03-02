const EventEmitter = require("events");
const {Mutex} = require("async-mutex");
const {UnititializedClassError} = require("../common");
const BackendController = require("./backend-controller");
const BackendSearcher = require("./backend-searcher");

const mutex = new Mutex();

class Backend extends EventEmitter {
    constructor(db) {
        super();
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.controller = new BackendController(db);
        that.private.searcher = new BackendSearcher();

        that.private.rejectIfNotInitialized = (methodName) => new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("Backend", methodName));
                return;
            }
            resolve();
        });

        that.private.throwIfNotInitialized = (methodName) => {
            if (that.private.initialized === false) {
                throw new UnititializedClassError("Backend", methodName);
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

                that.private.controller.on("error", (error, id) => {
                    that.emit("error", error, `BackendController.${id}`);
                });
                that.private.controller.initialize().
                then(() => {
                    that.private.searcher.on("error", (error) => {
                        that.emit("error", error, "BackendController");
                    });
                    that.private.searcher.on("found", (tv) => {
                        that.private.controller.tvUpsert(tv);
                    });
                    return that.private.searcher.initialize();
                }).
                then(() => {
                    that.private.initialized = true;
                    resolve();
                    // eslint-disable-next-line no-useless-return
                    return;
                }).
                catch(reject);
            });
        }
    }

    start() {
        return this.private.rejectIfNotInitialized("start").
            then(() => this.private.searcher.now());
    }

    runCommand(event) {
        return this.private.rejectIfNotInitialized("runCommand").
            then(() => this.private.controller.runCommand(event));
    }

    skillCommand(event) {
        return this.private.rejectIfNotInitialized("skillCommand").
            then(() => this.private.controller.skillCommand(event));
    }

    getUDNList() {
        return this.private.rejectIfNotInitialized("getUDNList").
            then(() => this.private.controller.getUDNList());
    }

    tv(udn) {
        this.private.throwtIfNotInitialized("tv");
        return this.private.controller.tv(udn);
    }

    lgtvCommand(udn, command) {
        return this.private.rejectIfNotInitialized("lgtvCommand").
            then(() => this.private.controller.lgtvCommand(udn, command));
    }

    getPowerState(udn) {
        this.private.throwtIfNotInitialized("getPowerState");
        return this.private.controller.getPowerState(udn);
    }

    turnOff(udn) {
        return this.private.rejectIfNotInitialized("turnOff").
            then(() => this.private.controller.turnOff(udn));
    }

    turnOn(udn) {
        return this.private.rejectIfNotInitialized("turnOn").
            then(() => this.private.controller.turnOn(udn));
    }
}

module.exports = Backend;