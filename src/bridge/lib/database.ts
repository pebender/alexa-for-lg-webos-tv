import Datastore from "@seald-io/nedb";
import * as Common from "../../common";
const persistPath = require("persist-path");

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
  private _indexes: string[];
  private _key: string;
  private _db: Datastore;
  private constructor(indexes: string[], key: string, db: Datastore) {
    this._indexes = indexes;
    this._key = key;
    this._db = db;
  }

  public static async build(
    name: string,
    indexes: string[],
    key: string
  ): Promise<DatabaseTable> {
    const configurationDir = persistPath(
      Common.constants.application.name.safe
    );

    //
    // This operation is synchronous. It is both expected and desired because it
    // occurs once at startup and because the database is needed before the LG
    // webOS TV bridge can run.
    //
    const db = new Datastore({ filename: `${configurationDir}/${name}.nedb` });

    db.loadDatabaseAsync();

    function index(fieldName: string): Promise<void> {
      return db.ensureIndexAsync({ fieldName, unique: true });
    }
    await Promise.all(indexes.map(index));

    return new DatabaseTable(indexes, key, db);
  }

  public async clean(): Promise<void> {
    const query1: DatabaseQuery = {};
    query1[this._key] = { $exists: false };
    const query2: DatabaseQuery = {};
    query2[this._key] = null;
    const query: DatabaseQuery = { $or: [query1, query2] };
    await this._db.removeAsync(query, { multi: true });
    await this._db.compactDatafileAsync();
  }

  public async deleteRecord(query: DatabaseQuery): Promise<void> {
    await this._db.removeAsync(query, { multi: true });
    await this._db.compactDatafileAsync();
  }

  public async getRecord(query: DatabaseQuery): Promise<DatabaseRecord | null> {
    return await this._db.findOneAsync<DatabaseRecord>(query).execAsync();
  }

  public async getRecords(query: DatabaseQuery): Promise<DatabaseRecord[]> {
    return await this._db.findAsync<DatabaseRecord>(query).execAsync();
  }

  public async insertRecord(record: DatabaseRecord): Promise<void> {
    await this._db.insertAsync(record);
    await this._db.compactDatafileAsync();
  }

  public async updateRecord(
    query: DatabaseQuery,
    update: DatabaseUpdate
  ): Promise<void> {
    await this._db.updateAsync(query, update, {});
    await this._db.compactDatafileAsync();
  }

  public async updateOrInsertRecord(
    query: DatabaseQuery,
    update: DatabaseUpdate
  ): Promise<void> {
    await this._db.updateAsync(query, update, { upsert: true });
    await this._db.compactDatafileAsync();
  }
}
