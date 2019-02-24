const EventEmitter = require("events");
const LGTVSearcher = require("./lgtv-searcher.js");
const LGTVController = require("./lgtv-controller.js");
const customSkill = require("./custom-skill");
const smartHomeSkill = require("./smart-home-skill");

class LGTV extends EventEmitter {
    constructor(db) {
        super();
        const that = this;

        that.private = {};
        this.private.initialized = false;
        this.private.controller = new LGTVController(db);
        this.private.searcher = new LGTVSearcher();

        this.private.controller.on("error", (error, udn) => {
            that.emit("error", error, "controller", udn);
        });
        this.private.searcher.on("found", (tv) => {
            this.private.controller.tvUpsert(tv);
        });
        this.private.searcher.on("error", (error) => {
            that.emit("error", error, "searcher");
        });

    }

    initialize() {
        return new Promise((resolve) => {
            if (!this.private.initialized) {
                resolve(Promise.all([
                    this.private.searcher.initialize(),
                    this.private.controller.initialize()
                ]).
                then(() => {
                    this.private.initialized = true;
                }));
            }
            resolve();
        });
    }

    get searcher() {
        return this.private.searcher;
    }

    get controller() {
        return this.private.controller;
    }

    customSkillCommand(event) {
        return customSkill.handler(this.private.controller, event);
    }

    smartHomeSkillCommand(event) {
        return smartHomeSkill.handler(this.private.controller, event);
    }
}

module.exports = LGTV;