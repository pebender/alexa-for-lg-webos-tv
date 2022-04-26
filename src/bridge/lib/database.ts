import { BaseClass } from "./base-class";
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

export class DatabaseTable extends BaseClass {
  private _indexes: string[];
  private _key: string;
  private _db: Datastore;
  public constructor(name: string, indexes: string[], key: string) {
    super();

    this._indexes = indexes;
    this._key = key;

    const configurationDir = persistPath(
      Common.constants.application.name.safe
    );

    //
    // This operation is synchronous. It is both expected and desired because it
    // occurs once at startup and because the database is needed before the LG
    // webOS TV bridge can run.
    //
    this._db = new Datastore({ filename: `${configurationDir}/${name}.nedb` });
    this._db.loadDatabaseAsync();
  }

  public initialize(): Promise<void> {
    const that = this;

    function initializeFunction(): Promise<void> {
      function index(fieldName: string): Promise<void> {
        return that._db.ensureIndexAsync({ fieldName, unique: true });
      }
      return Promise.all(that._indexes.map(index)).then();
    }

    return this.initializeHandler(initializeFunction);
  }

  public async clean(): Promise<void> {
    this.throwIfUninitialized("clean");
    const query1: DatabaseQuery = {};
    query1[this._key] = { $exists: false };
    const query2: DatabaseQuery = {};
    query2[this._key] = null;
    const query: DatabaseQuery = { $or: [query1, query2] };
    await this._db.removeAsync(query, { multi: true });
    await this._db.compactDatafileAsync();
  }

  public async getRecord(query: DatabaseQuery): Promise<DatabaseRecord> {
    this.throwIfUninitialized("getRecord");
    return await this._db.findOneAsync<DatabaseRecord>(query).execAsync();
  }

  public async getRecords(query: DatabaseQuery): Promise<DatabaseRecord[]> {
    this.throwIfUninitialized("getRecords");
    return await this._db.findAsync<DatabaseRecord>(query).execAsync();
  }

  public async insertRecord(record: DatabaseRecord): Promise<void> {
    this.throwIfUninitialized("insertRecord");
    await this._db.insertAsync(record);
    await this._db.compactDatafileAsync();
  }

  public async updateRecord(
    query: DatabaseQuery,
    update: DatabaseUpdate
  ): Promise<void> {
    this.throwIfUninitialized("updateRecord");
    await this._db.updateAsync(query, update, {});
    await this._db.compactDatafileAsync();
  }

  public async updateOrInsertRecord(
    query: DatabaseQuery,
    update: DatabaseUpdate
  ): Promise<void> {
    this.throwIfUninitialized("updateOrInsertRecord");
    await this._db.updateAsync(query, update, { upsert: true });
    await this._db.compactDatafileAsync();
  }
}
