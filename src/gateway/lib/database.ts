import {AlexaLGwebOSTVObject} from "./error-classes";
import Datastore from "nedb";

export interface DatabaseUpdate {
    [x: string]: boolean | number | string | object | null;
}
export interface DatabaseQuery {
    [x: string]: boolean | number | string | object | null;
}
export interface DatabaseRecord {
    [x: string]: boolean | number | string | object | null;
}

export class DatabaseTable extends AlexaLGwebOSTVObject {
    private _indexes: string[];
    private _key: string;
    private _db: Datastore;
    public constructor(path: string, name: string, indexes: string[], key: string) {
        super();

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

    public initialize(): Promise<void> {
        const that = this;
        const initializeFunction = (): Promise<void> => new Promise<void>((resolve): void => {
            that._indexes.forEach((record): void => {
                that._db.ensureIndex({
                    "fieldName": record,
                    "unique": true
                });
            });
            resolve();
        });
        return this.initializeHandler(initializeFunction);
    }

    public async clean(): Promise<void> {
        this.throwIfUninitialized("clean");
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
        this.throwIfUninitialized("getRecord");
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
        this.throwIfUninitialized("getRecords");
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
        this.throwIfUninitialized("insertRecord");
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
        this.throwIfUninitialized("updateRecord");
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
        this.throwIfUninitialized("updateOrInsertRecord");
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