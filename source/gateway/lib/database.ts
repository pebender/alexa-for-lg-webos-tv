import Datastore from "nedb";
import {Mutex} from "async-mutex";
import {UninitializedClassError} from "../common";

export type DatabaseUpdate = any;
export type DatabaseQuery = any;
export type DatabaseRecord = any;

export class DatabaseTable {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _indexes: string[];
    private _key: string;
    private _db: Datastore;
    private _throwIfNotInitialized: (methodName: string) => void;
    public constructor(path: string, name: string, indexes: string[], key: string) {
        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._indexes = indexes;
        this._key = key;

        /*
         * This operation is synchronous. It is both expected and desired because it
         * occures once at startup and because the database is needed before the LG
         * webOS TV gateway can run.
         */
        try {
            this._db = new Datastore({"filename": `${path}/${name}.nedb`});
        } catch (error) {
            throw error;
        }
        this._db.loadDatabase((error) => {
            if (error) {
                throw error;
            }
        });

        this._throwIfNotInitialized = (methodName) => {
            if (this._initialized === false) {
                throw new UninitializedClassError("ServerSecurity", methodName);
            }
        };
    }

    public initialize(): Promise<void> {
        const that = this;
        return that._initializeMutex.runExclusive(() => new Promise<void>((resolve) => {
            that._indexes.forEach((record) => {
                that._db.ensureIndex({
                    "fieldName": record,
                    "unique": true
                });
            });
            that._initialized = true;
            resolve();
        }));
    }

    public async clean(): Promise<void> {
        this._throwIfNotInitialized("clean");
        const query1: DatabaseQuery | null = {};
        query1[this._key] = {"$exists": false};
        const query2: DatabaseQuery | null = {};
        query2[this._key] = null;
        // eslint-disable-next-line array-element-newline
        const query: DatabaseQuery = {"$or": [query1, query2]};
        await new Promise<void>((resolve, reject) => {
            this._db.remove(
                query,
                {"multi": true},
                // eslint-disable-next-line no-unused-vars
                (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                }
            );
        });
    }

    public async getRecord(query: DatabaseQuery): Promise<DatabaseRecord> {
        this._throwIfNotInitialized("getRecord");
        const record = await new Promise<DatabaseRecord>((resolve, reject) => {
            this._db.findOne(
                query,
                (err, doc: DatabaseRecord) => {
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

    public async getRecords(query: DatabaseQuery): Promise<DatabaseRecord[]> {
        this._throwIfNotInitialized("getRecords");
        const records = await new Promise<DatabaseRecord[]>((resolve, reject) => {
            this._db.find(
                query,
                (error: Error, docs: DatabaseRecord[]) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(docs);
                }
            );
        });
        return records;
    }

    public async insertRecord(record: DatabaseRecord): Promise<void> {
        this._throwIfNotInitialized("insertRecord");
        await new Promise<void>((resolve, reject) => {
            this._db.insert(record, (error) => {
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

    public async updateRecord(query: DatabaseQuery, update: DatabaseUpdate): Promise<void> {
        this._throwIfNotInitialized("updateRecord");
        await new Promise<void>((resolve, reject) => {
            this._db.update(
                query,
                update,
                {},
                (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                }
            );
        });
    }

    public async updateOrInsertRecord(query: DatabaseQuery, update: DatabaseUpdate): Promise<void> {
        this._throwIfNotInitialized("updateOrInsertRecord");
        await new Promise<void>((resolve, reject) => {
            this._db.update(
                query,
                update,
                {"upsert": true},
                // eslint-disable-next-line no-unused-vars
                (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                }
            );
        });
    }
}