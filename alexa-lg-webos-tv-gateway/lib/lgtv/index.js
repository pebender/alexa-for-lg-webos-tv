const EventEmitter = require("events");
const {UnititializedClassError} = require("../common");
const LGTVController = require("./lgtv-controller");
const LGTVSearcher = require("./lgtv-searcher");

class LGTV extends EventEmitter {
    constructor(db) {
        super();
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.initializing = false;
        that.private.controller = new LGTVController(db);
        that.private.searcher = new LGTVSearcher();

        that.private.rejectIfNotInitialized = (methodName) => new Promise((resolve, reject) => {
            if (this.private.initialized === false) {
                reject(new UnititializedClassError("LGTV", methodName));
                return;
            }
            resolve();
        });

        that.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("LGTV", methodName);
            }
        };
    }

    initialize() {
        return new Promise((resolve, reject) => {
            if (this.private.initializing === true) {
                resolve();
                return;
            }
            this.private.initializing = true;

            const that = this;
            if (that.private.initialized === true) {
                that.private.initializing = false;
                resolve();
                return;
            }

            that.private.controller.on("error", (error, id) => {
                that.emit("error", error, `LGTVController.${id}`);
            });
            that.private.controller.initialize().
            then(() => {
                that.private.searcher.on("error", (error) => {
                    that.emit("error", error, "LGTVController");
                });
                that.private.searcher.on("found", (tv) => {
                    that.private.controller.tvUpsert(tv);
                });
                return that.private.searcher.initialize();
            }).
            then(() => {
                that.private.initialized = true;
                that.private.initializing = false;
                resolve();
                // eslint-disable-next-line no-useless-return
                return;
            }).
            catch((error) => {
                reject(error);
                // eslint-disable-next-line no-useless-return
                return;
            });
        });
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

module.exports = LGTV;