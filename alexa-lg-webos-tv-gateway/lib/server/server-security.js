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

    initialize(callback) {
        if (this.private.initializing === true) {
            return;
        }
        this.private.initializing = true;
        const that = this;

        that.private.db.findOne(
            {"username": that.private.dbRecord.username},
            (err, doc) => {
                if (err) {
                    callback(err);
                    return;
                } else if (doc === null) {
                    // eslint-disable-next-line no-unused-vars
                    that.private.db.insert(that.private.dbRecord, (error, _doc) => {
                        if (error) {
                            callback(error);
                            // eslint-disable-next-line no-useless-return
                            return;
                        }
                    });
                }
                that.private.dbRecord.username = doc.username;
                that.private.dbRecord.password = doc.password;
                that.private.dbRecord.hostname = doc.hostname;
            }
        );
        that.private.initialized = true;
        that.private.initializing = true;
    }

    get username() {
        const that = this;

        return that.private.dbRecord.username;
    }

    get password() {
        const that = this;

        return that.private.dbRecord.password;
    }

    set password(value) {
        const that = this;

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
        that.private.db.update(
            {"username": that.private.dbRecord.username},
            {"$set": {"password": that.private.dbRecord.password}}
        );
    }

    get hostname() {
        const that = this;

        return that.private.dbRecord.hostname;
    }

    set hostname(value) {
        const that = this;

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
        that.private.db.update(
            {"username": that.private.dbRecord.username},
            {"$set": {"hostname": that.private.dbRecord.hostname}}
        );
    }
}

module.exports = ServerSecurity;