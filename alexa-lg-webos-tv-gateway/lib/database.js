const {Mutex} = require("async-mutex");
const Datastore = require("nedb");
const {UnititializedClassError, callbackToPromise} = require("./common");

const mutex = new Mutex();

class DatabaseTable {
    constructor(path, name, indexes, key) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
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

        that.private.rejectIfNotInitialized = (methodName) => new Promise((resolve, reject) => {
            if (that.private.initialized === false) {
                reject(new UnititializedClassError("DatabaseTable", methodName));
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
                that.private.indexes.forEach((record) => {
                    that.private.db.ensureIndex({
                        "fieldName": record,
                        "unique": true
                    });
                });
                that.private.initialized = true;
                resolve();
            });
        }
    }

    static clean() {
        return this.private.rejectIfNotInitialized("clean").
        then(() => {
            const that = this;
            return new Promise((resolve, reject) => {
                const query1 = {};
                query1[that.private.key] = {"$exists": false};
                const query2 = {};
                query2[that.private.key] = null;
                // eslint-disable-next-line array-element-newline
                const query = {"$or": [query1, query2]};
                that.private.db.remove(
                    query,
                    {"multi": true},
                    // eslint-disable-next-line no-unused-vars
                    (error, _numRemoved) => callbackToPromise(resolve, reject, error, that.private.db)
                );
            });
        });
    }

    getRecord(query) {
        return this.private.rejectIfNotInitialized("getRecord").
        then(() => new Promise((resolve, reject) => {
            const that = this;

            that.private.db.findOne(
                query,
                (err, doc) => callbackToPromise(resolve, reject, err, doc)
            );
        }));
    }

    getRecords(query) {
        return this.private.rejectIfNotInitialized("getRecords").
        then(() => new Promise((resolve, reject) => {
            const that = this;

            that.private.db.find(
                query,
                (err, docs) => callbackToPromise(resolve, reject, err, docs)
            );
        }));
    }

    insertRecord(record) {
        return this.private.rejectIfNotInitialized("insertRecord").
        then(() => new Promise((resolve, reject) => {
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
        }));
    }

    updateRecord(query, update) {
        return this.private.rejectIfNotInitialized("updateRecord").
        then(() => new Promise((resolve, reject) => {
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
        }));
    }

    updateOrInsertRecord(query, update) {
        return this.private.rejectIfNotInitialized("updateOrInsertRecord").
        then(() => new Promise((resolve, reject) => {
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
        }));
    }
}

module.exports = DatabaseTable;