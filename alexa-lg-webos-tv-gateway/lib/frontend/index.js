
const {Mutex} = require("async-mutex");
const {UnititializedClassError} = require("alexa-lg-webos-tv-common");
const ServerSecurity = require("./frontend-security");
const ServerInternal = require("./frontend-internal");
const ServerExternal = require("./frontend-external");

class Server {
    constructor(db, backend) {
        this.private = {};
        this.private.initialized = false;
        this.private.initializeMutex = new Mutex();
        this.private.security = new ServerSecurity(db);
        this.private.internal = new ServerInternal(this.private.security);
        this.private.external = new ServerExternal(this.private.security, backend);

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("Server", methodName);
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
            await that.private.security.initialize();
            await that.private.internal.initialize();
            await that.private.external.initialize();
            that.private.initialized = true;
            resolve();
        }));
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