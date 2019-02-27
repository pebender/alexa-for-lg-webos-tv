
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

        that.private.security.initialize((securityError) => {
            if (securityError) {
                that.private.initializing = false;
                callback(securityError);
                return;
            }
            that.private.internal.initialize((internalError) => {
                if (internalError) {
                    that.private.initializing = false;
                    callback(internalError);
                    return;
                }
                that.private.external.initialize((externalError) => {
                    if (externalError) {
                        that.private.initializing = false;
                        callback(externalError);
                        return;
                    }
                    that.private.initialized = true;
                    that.private.initializing = false;
                    callback(null);
                    // eslint-disable-next-line no-useless-return
                    return;
                });
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