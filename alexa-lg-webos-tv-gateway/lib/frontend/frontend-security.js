const {Mutex} = require("async-mutex");
const {constants} = require("alexa-lg-webos-tv-common");
const {UnititializedClassError} = require("../common");

const mutex = new Mutex();

class ServerSecurity {
    constructor(db) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.db = db;

        that.private.rejectIfNotInitialized = (methodName) => new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("ServerSecurity", methodName));
                return;
            }
            resolve();
        });
    }

    initialize() {
        const that = this;
        return mutex.runExclusive(initializeHandler);
        function initializeHandler() {
            return new Promise((resolve) => {
                if (that.private.initialized === true) {
                    resolve();
                    return;
                }
                that.private.initialized = true;
                resolve();
            });
        }
    }

    authorizeRoot(username, password) {
        return this.private.rejectIfNotInitialized("authorizeRoot").
            then(() => {
                if (username === "HTTP" && password === constants.gatewayRootPassword) {
                    return true;
                }
                return false;
            });
    }

    authorizeUser(username, password) {
        return this.private.rejectIfNotInitialized("authorizeUser").
            then(() => this.private.db.getRecord({"name": "password"})).
            then((record) => {
                if (record === null ||
                    Reflect.has(record, "value") === false ||
                    record.value === null) {
                    return false;
                }
                if (username === "LGTV" && password === record.value) {
                    return true;
                }
                return false;
            });
    }

    userPasswordIsNull() {
        return this.private.rejectIfNotInitialized("userPasswordIsNull").
            then(() => this.private.db.getRecord({"name": "password"})).
            then((record) => {
                if (record === null ||
                    Reflect.has(record, "value") === false ||
                    record.value === null
                ) {
                    return true;
                }
                return false;
            });
    }

    setUserPassword(password) {
        return this.private.rejectIfNotInitialized("setUserPassword").
            then(() => {
                this.private.db.updateOrInsertRecord(
                    {"name": "password"},
                    {
                        "name": "password",
                        "value": password
                    }
                );
            });
    }

    getHostname() {
        return this.private.rejectIfNotInitialized("getHostname").
            then(() => this.private.db.getRecord({"name": "hostname"})).
            then((record) => {
                if (record === null || Reflect.has(record, "value") === false) {
                    return "";
                }
                return record.value;
            });
    }

    setHostname(hostname) {
        return this.private.rejectIfNotInitialized("setHostname").
            then(() => {
                this.private.db.updateOrInsertRecord(
                    {"name": "hostname"},
                    {
                        "name": "hostname",
                        "value": hostname
                    }
                );
            });
    }
}

module.exports = ServerSecurity;