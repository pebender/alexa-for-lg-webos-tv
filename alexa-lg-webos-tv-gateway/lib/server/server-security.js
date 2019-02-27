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

            that.private.db.getRecord({"username": that.private.dbRecord.username}).
            then((record) => {
                if (record === null) {
                    // eslint-disable-next-line no-unused-vars
                    that.private.db.insertRecord(that.private.dbRecord).
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
                } else {
                    that.private.dbRecord.username = record.username;
                    that.private.dbRecord.password = record.password;
                    that.private.dbRecord.hostname = record.hostname;
                    that.private.initialized = true;
                    that.private.initializing = false;
                    resolve();
                    // eslint-disable-next-line no-useless-return
                    return;
                }
            }).
            catch((error) => {
                that.private.initializing = false;
                reject(error);
                // eslint-disable-next-line no-useless-return
                return;
            });
        });
    }

    get username() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("ServerSecurity", "get+username");
        }

        return that.private.dbRecord.username;
    }

    get password() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("ServerSecurity", "get+password");
        }

        return that.private.dbRecord.password;
    }

    set password(value) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("ServerSecurity", "set+password");
        }

        if (typeof value === "undefined") {
            that.private.dbRecord.password = null;
        } else if (value === null) {
            that.private.dbRecord.password = null;
        } else if (value === "") {
            that.private.dbRecord.password = null;
        } else if (typeof value === "string") {
            that.private.dbRecord.password = value;
        } else if (typeof value.toString() === "undefined") {
            that.private.dbRecord.password = null;
        } else if (value.toString() === null) {
            that.private.dbRecord.password = null;
        } else if (value.toString() === "") {
            that.private.dbRecord.password = null;
        } else {
            that.private.dbRecord.password = value.toString();
        }
        that.private.db.updateRecord(
            {"username": that.private.dbRecord.username},
            {"$set": {"password": that.private.dbRecord.password}}
        );
    }

    get hostname() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("ServerSecurity", "get+hostname");
        }

        return that.private.dbRecord.hostname;
    }

    set hostname(value) {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("ServerSecurity", "set+hostname");
        }

        if (typeof value === "undefined") {
            that.private.dbRecord.hostname = null;
        } else if (value === null) {
            that.private.dbRecord.hostname = null;
        } else if (value === "") {
            that.private.dbRecord.hostname = null;
        } else if (typeof value === "string") {
            that.private.dbRecord.hostname = value;
        } else if (typeof value.toString() === "undefined") {
            that.private.dbRecord.hostname = null;
        } else if (value.toString() === null) {
            that.private.dbRecord.hostname = null;
        } else if (value.toString() === "") {
            that.private.dbRecord.hostname = null;
        } else {
            that.private.dbRecord.hostname = value.toString();
        }
        that.private.db.updateRecord(
            {"username": that.private.dbRecord.username},
            {"$set": {"hostname": that.private.dbRecord.hostname}}
        );
    }
}

module.exports = ServerSecurity;