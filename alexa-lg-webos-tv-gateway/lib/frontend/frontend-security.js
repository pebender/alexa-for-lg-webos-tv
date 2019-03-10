const {Mutex} = require("async-mutex");
const {constants} = require("alexa-lg-webos-tv-common");
const {UnititializedClassError} = require("../common");

const mutex = new Mutex();

class ServerSecurity {
    constructor(db) {
        this.private = {};
        this.private.initialized = false;
        this.private.db = db;

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("ServerSecurity", methodName);
            }
        };
    }

    initialize() {
        return mutex.runExclusive(() => new Promise((resolve) => {
            if (this.private.initialized === true) {
                resolve();
                return;
            }
            this.private.initialized = true;
            resolve();
        }));
    }

    authorizeRoot(username, password) {
        this.private.throwIfNotInitialized("authorizeRoot");
        if (username === "HTTP" && password === constants.gatewayRootPassword) {
            return true;
        }
        return false;
    }

    async authorizeUser(username, password) {
        this.private.throwIfNotInitialized("authorizeUser");
        const record = await this.private.db.getRecord({"name": "password"});
        if (record === null ||
            Reflect.has(record, "value") === false ||
            record.value === null) {
            return false;
        }
        if (username === "LGTV" && password === record.value) {
            return true;
        }
        return false;
    }

    async userPasswordIsNull() {
        this.private.throwIfNotInitialized("userPasswordIsNull");
        const record = await this.private.db.getRecord({"name": "password"});
        if (record === null ||
            Reflect.has(record, "value") === false ||
            record.value === null
        ) {
            return true;
        }
        return false;
    }

    setUserPassword(password) {
        this.private.throwIfNotInitialized("setUserPassword");
        return this.private.db.updateOrInsertRecord(
            {"name": "password"},
            {
                "name": "password",
                "value": password
            }
        );
    }

    async getHostname() {
        this.private.throwIfNotInitialized("getHostname");
        const record = await this.private.db.getRecord({"name": "hostname"});
        if (record === null || Reflect.has(record, "value") === false) {
            return "";
        }
        return record.value;
    }

    setHostname(hostname) {
        this.private.throwIfNotInitialized("setHostname");
        return this.private.db.updateOrInsertRecord(
            {"name": "hostname"},
            {
                "name": "hostname",
                "value": hostname
            }
        );
    }
}

module.exports = ServerSecurity;