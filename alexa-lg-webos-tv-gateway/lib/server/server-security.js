const {callbackToPromise} = require("../common");
const {constants} = require("alexa-lg-webos-tv-common");

class ServerSecurity {
    constructor(db) {
        this.private = {};
        this.private.profile = "default";
        this.private.db = db;
    }


    rootAuthorize(username, password) {
        return Promise.all([
            this.getRootUsername(),
            this.getRootPassword()
        ]).then((values) => {
            const [
                user,
                pass
            ] = values;
            if ((username === user) && (password === pass)) {
                return true;
            }
            return false;
        });
    }

    authorize(username, password) {
        return Promise.all([
            this.getUsername(),
            this.getPassword()
        ]).then((values) => {
            const [
                user,
                pass
            ] = values;
            if ((username === user) && (password === pass)) {
                return true;
            }
            return false;
        });
    }

    // eslint-disable-next-line class-methods-use-this
    get getRootUsername() {
        return Promise.resolve("HTTP");
    }

    // eslint-disable-next-line class-methods-use-this
    getRootPassword() {
        return Promise.resolve(constants.password);
    }

    // eslint-disable-next-line class-methods-use-this
    get getUsername() {
        return Promise.resolve("LGTV");
    }

    getPassword() {
        const that = this;
        return new Promise((resolve, reject) => {
resolve("0");
return;
            // eslint-disable-next-line no-unreachable
            that.private.db.findOne(
                {"name": "password"},
                (err, doc) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if ((doc === null) ||
                        (Reflect.has(doc, "value") === false)
                    ) {
                        resolve(null);
                        return;
                    }
                    resolve(doc.value);
                }
            );
        });
    }

    setPassword(value) {
        const that = this;
        return new Promise((resolve, reject) => {
            let password = null;
            if (typeof value === "undefined") {
                password = null;
            } else if (value === null) {
                password = null;
            } else if (value === "") {
                password = null;
            } else if (typeof value === "string") {
                password = value;
            } else if (typeof value.toString() === "undefined") {
                password = null;
            } else if (value.toString() === null) {
                password = null;
            } else if (value.toString() === "") {
                password = null;
            } else {
                password = value.toString();
            }
            that.private.db.update(
                {"name": "password"},
                {"name": "password",
                 "value": password},
                {"upsert": true},
                // eslint-disable-next-line no-unused-vars
                (err, _numAffected, _affectedDocuments, _upsert) => callbackToPromise(resolve, reject, err, password)
            );
        });
    }

    getHostname() {
        const that = this;
        return new Promise((resolve, reject) => {
            that.private.db.findOne(
                {"name": "hostname"},
                (err, doc) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if ((doc === null) ||
                        (Reflect.has(doc, "value") === false) ||
                        (doc.value === null)
                    ) {
                        resolve("");
                        return;
                    }
                    resolve(doc.value);
                }
            );
        });
    }

    setHostname(value) {
        const that = this;
        return new Promise((resolve, reject) => {
            let hostname = "";
            if (typeof value === "undefined") {
                hostname = "";
            } else if (value === null) {
                hostname = "";
            } else if (value === "") {
                hostname = "";
            } else if (typeof value === "string") {
                hostname = value;
            } else if (typeof value.toString() === "undefined") {
               hostname = "";
            } else if (value.toString() === null) {
                hostname = "";
            } else if (value.toString() === "") {
                hostname = "";
            } else {
                hostname = value.toString();
            }
            that.private.db.update(
                {"name": "hostname"},
                {"name": "hostname",
                 "value": hostname},
                {"upsert": true},
                // eslint-disable-next-line no-unused-vars
                (err, _numAffected, _affectedDocuments, _upsert) => callbackToPromise(resolve, reject, err, hostname)
            );
        });
    }
}

module.exports = ServerSecurity;