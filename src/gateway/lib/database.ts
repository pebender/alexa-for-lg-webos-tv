import Datastore from "nedb";
import {Mutex} from "async-mutex";
import {UninitializedClassError} from "../../common";

export interface DatabaseUpdate {
    [x: string]: boolean | number | string | object | null;
}
export interface DatabaseQuery {
    [x: string]: boolean | number | string | object | null;
}
export interface DatabaseRecord {
    [x: string]: boolean | number | string | object | null;
}

export class DatabaseTable {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _indexes: string[];
    private _key: string;
    private _db: Datastore;
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
        this._db.loadDatabase((error): void => {
            if (error) {
                throw error;
            }
        });
    }

    private throwIfNotInitialized(methodName: string): void {
        if (this._initialized === false) {
            throw new UninitializedClassError("DatabaseTable", methodName);
        }
    }

    public initialize(): Promise<void> {
        const that = this;
        return that._initializeMutex.runExclusive((): Promise<void> => new Promise<void>((resolve): void => {
            that._indexes.forEach((record): void => {
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
        this.throwIfNotInitialized("clean");
        const query1: DatabaseQuery = {};
        query1[this._key] = {"$exists": false};
        const query2: DatabaseQuery = {};
        query2[this._key] = null;
        // eslint-disable-next-line array-element-newline
        const query: DatabaseQuery = {"$or": [query1, query2]};
        await new Promise<void>((resolve, reject): void => {
            this._db.remove(
                query,
                {"multi": true},
                // eslint-disable-next-line no-unused-vars
                (error): void => {
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
        this.throwIfNotInitialized("getRecord");
        const record = await new Promise<DatabaseRecord>((resolve, reject): void => {
            this._db.findOne(
                query,
                (err, doc: DatabaseRecord): void => {
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
        this.throwIfNotInitialized("getRecords");
        const records = await new Promise<DatabaseRecord[]>((resolve, reject): void => {
            this._db.find(
                query,
                (error: Error, docs: DatabaseRecord[]): void => {
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
        this.throwIfNotInitialized("insertRecord");
        await new Promise<void>((resolve, reject): void => {
            this._db.insert(record, (error): void => {
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
        this.throwIfNotInitialized("updateRecord");
        await new Promise<void>((resolve, reject): void => {
            this._db.update(
                query,
                update,
                {},
                (error): void => {
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
        this.throwIfNotInitialized("updateOrInsertRecord");
        await new Promise<void>((resolve, reject): void => {
            this._db.update(
                query,
                update,
                {"upsert": true},
                // eslint-disable-next-line no-unused-vars
                (error): void => {
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