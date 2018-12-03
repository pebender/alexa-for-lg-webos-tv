class HTTPAuthorization {
    constructor(db, callback) {
        this.private = {};
        this.private.dbRecord = {};
        this.private.dbRecord.username = 'LGTV';
        this.private.dbRecord.password = null;
        this.private.dbRecord.hostname = null;
        if (typeof callback === 'undefined' || db === null) {
            return;
        }
        if (typeof db === 'function') {
            return;
        }
        if (typeof db === 'undefined' || db === null) {
            return;
        }
        this.private.db = db;
        this.private.db.findOne(
            {'username': this.private.dbRecord.username},
            (err, doc) => {
                if (err) {
                    callback(err);
                    return null;
                } else if (doc === null) {
                    // eslint-disable-next-line no-unused-vars
                    this.private.db.insert(this.private.dbRecord, (error, _doc) => {
                        if (error) {
                            callback(error);
                            return null;
                        }
                        return null;
                    });
                } else {
                    this.private.dbRecord.username = doc.username;
                    this.private.dbRecord.password = doc.password;
                    this.private.dbRecord.hostname = doc.hostname;
                    return null;
                }
                return null;
            }
        );
    }

    get username() {
        return this.private.dbRecord.username;
    }

    get password() {
        return this.private.dbRecord.password;
    }

    set password(value) {
        if (typeof value === 'undefined') {
            this.private.dbRecord.password = null;
        } else if (value === null) {
            this.private.dbRecord.password = null;
        } else if (value === '') {
            this.private.dbRecord.password = null;
        } else if (typeof value === 'string') {
            this.private.dbRecord.password = value;
        } else if (typeof value.toString() === 'undefined') {
            this.private.dbRecord.password = null;
        } else if (value.toString() === null) {
            this.private.dbRecord.password = null;
        } else if (value.toString() === '') {
            this.private.dbRecord.password = null;
        } else {
            this.private.dbRecord.password = value.toString();
        }
        this.private.db.update(
            {'username': this.private.dbRecord.username},
            {'$set': {'password': this.private.dbRecord.password}}
        );
    }

    get hostname() {
        return this.private.dbRecord.hostname;
    }

    set hostname(value) {
        if (typeof value === 'undefined') {
            this.private.dbRecord.hostname = null;
        } else if (value === null) {
            this.private.dbRecord.hostname = null;
        } else if (value === '') {
            this.private.dbRecord.hostname = null;
        } else if (typeof value === 'string') {
            this.private.dbRecord.hostname = value;
        } else if (typeof value.toString() === 'undefined') {
            this.private.dbRecord.hostname = null;
        } else if (value.toString() === null) {
            this.private.dbRecord.hostname = null;
        } else if (value.toString() === '') {
            this.private.dbRecord.hostname = null;
        } else {
            this.private.dbRecord.hostname = value.toString();
        }
        this.private.db.update(
            {'username': this.private.dbRecord.username},
            {'$set': {'hostname': this.private.dbRecord.hostname}}
        );
    }
}

module.exports = HTTPAuthorization;