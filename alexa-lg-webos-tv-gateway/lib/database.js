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

    getRecord(query) {
        return new Promise((resolve, reject) => {
            const that = this;

            that.private.db.findOne(
                query,
                (err, doc) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(doc);
                    // eslint-disable-next-line no-useless-return
                    return;
                }
            );
        });
    }

    getRecords(query) {
        return new Promise((resolve, reject) => {
            const that = this;

            that.private.db.find(
                query,
                (err, docs) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(docs);
                    // eslint-disable-next-line no-useless-return
                    return;
                }
            );
        });
    }

    insertRecord(record) {
        return new Promise((resolve, reject) => {
            const that = this;

            // eslint-disable-next-line no-unused-vars
            that.private.db.insert(record, (error, _doc) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
                // eslint-disable-next-line no-useless-return
                return;
            });
        });
    }

    updateRecord(query, update) {
        return new Promise((resolve, reject) => {
            const that = this;

            that.private.db.update(
                query,
                update,
                // eslint-disable-next-line no-unused-vars
                (err, _numAffectedDocs, _affectedDocs, _upsert) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                }
            );
        });
    }

    updateOrInsertRecord(query, update) {
        return new Promise((resolve, reject) => {
            const that = this;

            that.private.db.update(
                query,
                update,
                {"upsert": true},
                // eslint-disable-next-line no-unused-vars
                (err, _numAffectedDocs, _affectedDocs, _upsert) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                }
            );
        });
    }
}

module.exports = DatabaseTable;