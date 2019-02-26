/* eslint-disable class-methods-use-this */
const Datastore = require("nedb");

class DatabaseTable {
    constructor(path, name, indexes, key) {
        const that = this;

        that.private = {};
        that.private.path = path;
        that.private.name = name;
        that.private.indexes = indexes;
        that.private.key = key;
        that.private.db = null;

        /*
         * This operation is synchronous. It is both expected and desired because it
         * occures once at startup and because the database is needed before the LG
         * webOS TV gateway can run.
         */
        try {
            that.private.db = new Datastore({"filename": `${that.private.path}/${name}.nedb`});
        } catch (error) {
            throw error;
        }
        that.private.db.loadDatabase((error) => {
            if (error) {
                throw error;
            }
        });
    }

    initialize(callback) {
        const that = this;
        that.private.indexes.forEach((record) => {
            that.private.db.ensureIndex({"fieldName": record,
            "unique": true});
        });
        callback(null);
    }

    get db() {
        const that = this;

        return that.private.db;
    }
}

module.exports = DatabaseTable;