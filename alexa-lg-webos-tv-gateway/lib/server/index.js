
const {UnititializedClassError} = require("../common");
const ServerSecurity = require("./server-security");
const ServerInternal = require("./server-internal");
const ServerExternal = require("./server-external");

class Server {
    constructor(db, lgtv) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.initializing = false;
        that.private.security = new ServerSecurity(db);
        that.private.internal = new ServerInternal(that.private.security);
        that.private.external = new ServerExternal(that.private.security, lgtv);
    }

    initialize(callback) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initializing === true) {
                resolve();
                return;
            }
            that.private.initializing = true;

            if (that.private.initialized === true) {
                that.private.initializing = false;
                resolve();
                return;
            }

            that.private.security.initialize().
                then(() => that.private.internal.initialize()).
                then(() => that.private.external.initialize()).
                then(() => {
                    that.private.initialized = true;
                    that.private.initializing = false;
                    resolve();
                    // eslint-disable-next-line no-useless-return
                    return;
                }).
                catch((error) => {
                    that.private.initializing = false;
                    reject(error);
                    // eslint-disable-next-line no-useless-return
                    return;
                });
        });
    }

    start() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("Server", "start");
        }

        that.private.internal.start();
        that.private.external.start();
    }

    get security() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("Server", "get+security");
        }
        return that.private.security;
    }

    get internal() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("Server", "get+internal");
        }
        return that.private.internal;
    }

    get external() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("Server", "get+external");
        }
        return that.private.external;
    }
}

module.exports = Server;