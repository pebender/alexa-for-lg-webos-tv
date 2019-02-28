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

    initialized() {
        return this.private.initialized;
    }

    start() {
        return isInitialized(this, "LGTV", "start").then(() => this.private.searcher.now());
    }

    runCommand(event) {
        return isInitialized(this, "LGTV", "runCommand").then(() => this.private.controller.runCommand(event));
    }

    skillCommand(event) {
        const that = this;
        return isInitialized(that, "LGTV", "skillCommand").then(() => that.private.controller.skillCommand(event));
    }

    getUDNList() {
        return isInitialized(this, "LGTV", "getUDNList").then(() => this.private.controller.getUDNList());
    }

    tv(udn) {
        return isInitialized(this, "LGTV", "tv").then(() => this.private.controller.tv(udn));
    }

    lgtvCommand(udn, command) {
        return isInitialized(this, "LGTV", "lgtvCommand").then(() => this.private.controller.lgtvCommand(udn, command));
    }

    getPowerState(udn) {
        return isInitialized(this, "LGTV", "getPowerState").then(() => this.private.controller.getPowerState(udn));
    }

    turnOff(udn) {
        return isInitialized(this, "LGTV", "turnOff").then(() => this.private.controller.turnOff(udn));
    }

    turnOn(udn) {
        return isInitialized(this, "LGTV", "turnOn").then(() => this.private.controller.turnOn(udn));
    }
}

function isInitialized(classObject, className, methodName) {
    return new Promise((resolve, reject) => {
        if (classObject.initialized() === false) {
            reject(new UnititializedClassError(className, methodName));
            return;
        }
        resolve(true);
    });
}

module.exports = LGTV;