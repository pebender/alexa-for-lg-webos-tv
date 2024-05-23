import Datastore from "@seald-io/nedb";
import persistPath from "persist-path";
import * as Common from "../../common";

export type DatabaseUpdate = Record<
  string,
  boolean | number | string | object | null
>;
export type DatabaseQuery = Record<
  string,
  boolean | number | string | object | null
>;
export type DatabaseRecord = Record<
  string,
  boolean | number | string | object | null
>;

export class DatabaseTable {
  private readonly _indexes: string[];
  private readonly _key: string;
  private readonly _database: Datastore;
  private constructor(indexes: string[], key: string, database: Datastore) {
    this._indexes = indexes;
    this._key = key;
    this._database = database;
  }

  public static async build(
    name: string,
    indexes: string[],
    key: string,
  ): Promise<DatabaseTable> {
    const configurationDirectory = persistPath(
      Common.constants.application.name.safe,
    );

    //
    // This operation is synchronous. It is both expected and desired because it
    // occurs once at startup and because the database is needed before the LG
    // webOS TV bridge can run.
    //
    const database = new Datastore({
      filename: `${configurationDirectory}/${name}.nedb`,
    });

    try {
      await database.loadDatabaseAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }

    async function index(fieldName: string): Promise<void> {
      await database
        .ensureIndexAsync({ fieldName, unique: true })
        .catch((error) => {
          throw new Common.DatabaseCommonError({
            cause: error,
          });
        });
    }
    await Promise.all(
      indexes.map(async (fieldName: string) => {
        await index(fieldName);
      }),
    );

    return new DatabaseTable(indexes, key, database);
  }

  public async clean(): Promise<void> {
    const query1: DatabaseQuery = {};
    query1[this._key] = { $exists: false };
    const query2: DatabaseQuery = {};
    query2[this._key] = null;
    const query: DatabaseQuery = { $or: [query1, query2] };
    try {
      await this._database.removeAsync(query, { multi: true });
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async deleteRecord(query: DatabaseQuery): Promise<void> {
    try {
      await this._database.removeAsync(query, { multi: true });
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async getRecord(query: DatabaseQuery): Promise<DatabaseRecord | null> {
    try {
      return await this._database
        .findOneAsync<DatabaseRecord>(query)
        .execAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async getRecords(query: DatabaseQuery): Promise<DatabaseRecord[]> {
    try {
      return await this._database.findAsync<DatabaseRecord>(query).execAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async insertRecord(record: DatabaseRecord): Promise<void> {
    try {
      await this._database.insertAsync(record);
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async updateRecord(
    query: DatabaseQuery,
    update: DatabaseUpdate,
  ): Promise<void> {
    try {
      await this._database.updateAsync(query, update, {});
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async updateOrInsertRecord(
    query: DatabaseQuery,
    update: DatabaseUpdate,
  ): Promise<void> {
    try {
      await this._database.updateAsync(query, update, { upsert: true });
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }
}
