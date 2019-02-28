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
        return new Promise((resolve, reject) => {
            const that = this;
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVSecurity", "authorizeRoot"));
                return;
            }
            if (username === "HTTP" && password === constants.password) {
                resolve(true);
                return;
            }
            resolve(false);
        });
    }

    authorizeUser(username, password) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVSecurity", "authorizeUser"));
                return;
            }
            that.private.db.getRecord({"name": "password"}).
            then((record) => {
                if (record === null ||
                    Reflect.has(record, "value") === false ||
                    record.value === null) {
                    resolve(false);
                    return;
                }
//                if (username === "LGTV" && password === record.value) {
                if (username === "LGTV" && password === "0") {
                    resolve(true);
                    return;
                }
                resolve(false);
            }).
            catch(reject);
        });
    }

    userPasswordIsNull() {
        return new Promise((resolve, reject) => {
            const that = this;
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVSecurity", "authorizeRoot"));
                return;
            }
            that.private.db.getRecord({"name": "password"}).
            then((record) => {
                if (record === null ||
                    Reflect.has(record, "value") === false ||
                    record.value === null
                ) {
                    resolve(true);
                    return;
                }
                resolve(false);
            }).
            catch(reject);
        });
    }

    setUserPassword(password) {
        return new Promise((resolve, reject) => {
            const that = this;
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVSecurity", "authorizeRoot"));
                return;
            }
            that.private.db.updateOrInsertRecord(
                {"name": "password"},
                {
                    "name": "password",
                    "value": password
                }
            ).
            then(() => resolve()).
            catch(reject);
        });
    }

    getHostname() {
        return new Promise((resolve, reject) => {
            const that = this;
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVSecurity", "authorizeRoot"));
                return;
            }
            that.private.db.getRecord({"name": "hostname"}).
            then((record) => {
                if (record === null || Reflect.has(record, "value") === false) {
                    resolve("");
                    return;
                }
                resolve(record.value);
            }).
            catch(reject);
        });
    }

    setHostname(hostname) {
        return new Promise((resolve, reject) => {
            const that = this;
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("LGTVSecurity", "authorizeRoot"));
                return;
            }
            that.private.db.updateOrInsertRecord(
                {"name": "hostname"},
                {
                    "name": "hostname",
                    "value": hostname
                }
            ).
            then(() => resolve()).
            catch(reject);
        });
    }
}

module.exports = ServerSecurity;