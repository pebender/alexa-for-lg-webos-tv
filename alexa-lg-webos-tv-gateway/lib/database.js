const {Mutex} = require("async-mutex");
const Datastore = require("nedb");
const {UnititializedClassError} = require("alexa-lg-webos-tv-common");

class DatabaseTable {
    constructor(path, name, indexes, key) {
        this.private = {};
        this.private.initialized = false;
        this.private.initializeMutex = new Mutex();
        this.private.path = path;
        this.private.name = name;
        this.private.indexes = indexes;
        this.private.key = key;
        this.private.db = null;

        /*
         * This operation is synchronous. It is both expected and desired because it
         * occures once at startup and because the database is needed before the LG
         * webOS TV gateway can run.
         */
        try {
            this.private.db = new Datastore({"filename": `${this.private.path}/${name}.nedb`});
        } catch (error) {
            throw error;
        }
        this.private.db.loadDatabase((error) => {
            if (error) {
                throw error;
            }
        });

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("ServerSecurity", methodName);
            }
        };
    }

    initialize() {
        const that = this;
        return that.private.initializeMutex.runExclusive(() => new Promise((resolve) => {
            that.private.indexes.forEach((record) => {
                that.private.db.ensureIndex({
                    "fieldName": record,
                    "unique": true
                });
            });
            that.private.initialized = true;
            resolve();
        }));
    }

    async clean() {
        this.private.throwIfNotInitialized("clean");
        const query1 = {};
        query1[this.private.key] = {"$exists": false};
        const query2 = {};
        query2[this.private.key] = null;
        // eslint-disable-next-line array-element-newline
        const query = {"$or": [query1, query2]};
        await new Promise((resolve, reject) => {
            this.private.db.remove(
                query,
                {"multi": true},
                // eslint-disable-next-line no-unused-vars
                (error, _numRemoved) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(this.private.db);
                }
            );
        });
    }

    async getRecord(query) {
        this.private.throwIfNotInitialized("getRecord");
        const record = await new Promise((resolve, reject) => {
            this.private.db.findOne(
                query,
                (err, doc) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(doc);
                }
            );
        });
        return record;
    }

    async getRecords(query) {
        this.private.throwIfNotInitialized("getRecords");
        const records = await new Promise((resolve, reject) => {
            this.private.db.find(
                query,
                (err, docs) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(docs);
                }
            );
        });
        return records;
    }

    async insertRecord(record) {
        this.private.throwIfNotInitialized("insertRecord");
        await new Promise((resolve, reject) => {
            // eslint-disable-next-line no-unused-vars
            this.private.db.insert(record, (error, _doc) => {
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

    async updateRecord(query, update) {
        this.private.throwIfNotInitialized("updateRecord");
        await new Promise((resolve, reject) => {
            this.private.db.update(
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

    async updateOrInsertRecord(query, update) {
        this.private.throwIfNotInitialized("updateOrInsertRecord");
        await new Promise((resolve, reject) => {
            this.private.db.update(
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