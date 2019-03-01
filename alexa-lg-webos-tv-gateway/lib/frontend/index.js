
const {UnititializedClassError} = require("../common");
const ServerSecurity = require("./frontend-security");
const ServerInternal = require("./frontend-internal");
const ServerExternal = require("./frontend-external");

class Server {
    constructor(db, backend) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.initializing = false;
        that.private.security = new ServerSecurity(db);
        that.private.internal = new ServerInternal(that.private.security);
        that.private.external = new ServerExternal(that.private.security, backend);

        that.private.throwIfNotInitialized = (methodName) => {
            if (that.private.initialized === false) {
                throw new UnititializedClassError("Server", methodName);
            }
        };
    }

    initialize() {
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
        this.private.throwIfNotInitialized("start");
        this.private.internal.start();
        this.private.external.start();
    }

    get security() {
        this.private.throwIfNotInitialized("get+security");
        return this.private.security;
    }

    get internal() {
        this.private.throwIfNotInitialized("get+internal");
        return this.private.internal;
    }

    get external() {
        this.private.throwIfNotInitialized("get+external");
        return this.private.external;
    }
}

module.exports = Server;