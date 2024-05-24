import Datastore from "@seald-io/nedb";
import persistPath from "persist-path";
import * as Common from "../../common";

export class DatabaseTable<DatabaseRecord> {
  private readonly _indexes: string[];
  private readonly _key: string;
  private readonly _database: Datastore;
  private constructor(indexes: string[], key: string, database: Datastore) {
    this._indexes = indexes;
    this._key = key;
    this._database = database;
  }

  public static async build<DatabaseRecord>(
    name: string,
    indexes: string[],
    key: string,
  ): Promise<DatabaseTable<DatabaseRecord>> {
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
    const query1: Record<string, unknown> = {};
    query1[this._key] = { $exists: false };
    const query2: Record<string, unknown> = {};
    query2[this._key] = null;
    const query: Record<string, unknown> = { $or: [query1, query2] };
    try {
      await this._database.removeAsync(query, { multi: true });
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async deleteRecord(
    query: Partial<DatabaseRecord> | Array<Partial<DatabaseRecord>>,
  ): Promise<void> {
    try {
      await this._database.removeAsync(
        Array.isArray(query) ? { $and: query } : query,
        { multi: true },
      );
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async getRecord(
    query: Partial<DatabaseRecord> | Array<Partial<DatabaseRecord>>,
  ): Promise<DatabaseRecord | null> {
    let record: Record<string, unknown> | null;
    try {
      record = await this._database
        .findOneAsync(Array.isArray(query) ? { $and: query } : query)
        .execAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
    if (record === null) {
      return null;
    }
    delete record._id;
    return record as DatabaseRecord;
  }

  public async getRecords(
    query: Partial<DatabaseRecord> | Array<Partial<DatabaseRecord>>,
  ): Promise<DatabaseRecord[]> {
    let records: Array<Record<string, unknown>>;
    try {
      records = await this._database
        .findAsync(Array.isArray(query) ? { $and: query } : query)
        .execAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
    for (const record of records) {
      delete record._id;
    }
    return records as DatabaseRecord[];
  }

  public async insertRecord(record: DatabaseRecord): Promise<void> {
    try {
      await this._database.insertAsync(record as Record<string, unknown>);
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async updateOrInsertRecord(
    query: Partial<DatabaseRecord> | Array<Partial<DatabaseRecord>>,
    record: DatabaseRecord,
  ): Promise<void> {
    try {
      await this._database.updateAsync(
        Array.isArray(query) ? { $and: query } : query,
        record,
        {
          upsert: true,
        },
      );
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async updateFields(
    query: Partial<DatabaseRecord> | Array<Partial<DatabaseRecord>>,
    fields: Partial<DatabaseRecord> | Array<Partial<DatabaseRecord>>,
  ): Promise<void> {
    try {
      await this._database.updateAsync(
        Array.isArray(query) ? { $and: query } : query,
        { $set: fields },
        {},
      );
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }
}
