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

    initialize(callback) {
        if (this.private.initializing === true) {
            callback(null);
            return;
        }
        this.private.initializing = true;

        const that = this;
        if (that.private.initialized === true) {
            that.private.initializing = false;
            callback(null);
            return;
        }

        that.private.controller.on("error", (error, id) => {
            that.emit("error", error, `LGTVController.${id}`);
        });
        that.private.controller.initialize((error) => {
            if (error) {
                callback(error);
                return;
            }
            that.private.searcher.on("error", (error) => {
                that.emit("error", error, "LGTVController");
            });
            that.private.searcher.on("found", (tv) => {
                that.private.controller.tvUpsert(tv);
            });
            that.private.searcher.initialize((searcherError) => {
                if (searcherError) {
                    callback(searcherError);
                    return;
                }
                that.private.initialized = true;
                that.private.initializing = false;
                callback(null);
                // eslint-disable-next-line no-useless-return
                return;
            });
        });
    }

    start() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("LGTVController", "skillCommand");
        }

        that.private.searcher.now();
    }

    get controller() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("Server", "get+controller");
        }
        return that.private.controller;
    }
}

module.exports = LGTV;