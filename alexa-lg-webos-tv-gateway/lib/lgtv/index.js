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

    start() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "start");
        }

        that.private.searcher.now();
    }

    runCommand(event) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "runCommand");
        }
        return that.private.controller.runCommand(event);
    }

    skillCommand(event) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "skillCommand");
        }
        return that.private.controller.skillCommand(event);
    }

    getUDNList() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "getUDNList");
        }
        return that.private.controller.getUDNList();
    }

    tv(udn) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "tv");
        }
        return that.private.controller.tv(udn);
    }

    lgtvCommand(udn, command) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "lgtvCommand");
        }
        return that.private.controller.lgtvCommand(udn, command);
    }

    getPowerState(udn) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "getPowerState");
        }
        return that.private.controller.getPowerState(udn);
    }

    turnOff(udn) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "turnOff");
        }
        return that.private.controller.turnOff(udn);
    }

    turnOn(udn) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTV", "turnOn");
        }
        return that.private.controller.turnOn(udn);
    }
}

module.exports = LGTV;