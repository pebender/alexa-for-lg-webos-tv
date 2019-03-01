const {constants} = require("alexa-lg-webos-tv-common");
const {UnititializedClassError} = require("../common");

class ServerSecurity {
    constructor(db) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.initializing = false;
        that.private.db = db;
        that.private.dbRecord = {};
        that.private.dbRecord.username = "LGTV";
        that.private.dbRecord.password = null;
        that.private.dbRecord.hostname = "";

        that.private.rejectIfNotInitialized = (methodName) => new Promise((resolve, reject) => {
            if (this.private.initialized === false) {
                reject(new UnititializedClassError("ServerSecurity", methodName));
                return;
            }
            resolve();
        });
    }

    initialize() {
        const that = this;
        return new Promise((resolve) => {
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
            that.private.initialized = true;
            that.private.initializing = false;
            resolve();
        });
    }

    authorizeRoot(username, password) {
        return this.private.rejectIfNotInitialized("authorizeRoot").
            then(() => {
                if (username === "HTTP" && password === constants.password) {
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
//                if (username === "LGTV" && password === record.value) {
                if (username === "LGTV" && password === "0") {
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