
const {Mutex} = require("async-mutex");
const {UnititializedClassError} = require("alexa-lg-webos-tv-common");
const ServerSecurity = require("./frontend-security");
const ServerInternal = require("./frontend-internal");
const ServerExternal = require("./frontend-external");

const mutex = new Mutex();

class Server {
    constructor(db, backend) {
        this.private = {};
        this.private.initialized = false;
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
        return mutex.runExclusive(() => new Promise(async (resolve) => {
            if (this.private.initialized === true) {
                resolve();
                return;
            }
            await this.private.security.initialize();
            await this.private.internal.initialize();
            await this.private.external.initialize();
            this.private.initialized = true;
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