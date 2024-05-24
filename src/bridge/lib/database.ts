import Datastore from "@seald-io/nedb";
import persistPath from "persist-path";
import * as Common from "../../common";

/**
 * AllowOnly and OneOf were lifted from {@link
 * https://github.com/salto-io/salto/blob/4465d201ae4881a8b3ecb42e3903eeb839ebd7c8/packages/lowerdash/src/types.ts}.
 * and explained at {@link https://amir.rachum.com/typescript-oneof/}.
 */
export type AllowOnly<T, K extends keyof T> = Pick<T, K> & {
  [P in keyof Omit<T, K>]?: never;
};
export type OneOf<T, K = keyof T> = K extends keyof T ? AllowOnly<T, K> : never;

/**
 * This generic class provides typed basic access to an {@link https://www.npmjs.com/package/@seald-io/nedb | @seald-io/nedb} database. `DatabaseRecord` specifies the fields in a record. It must be a `type` not an `interface` because it must have a signature so that we can limit it using `extends`.  You can learn more about this difference between a 'type' and an 'interface' at {@link https://github.com/microsoft/TypeScript/issues/15300}.
 */
export class DatabaseTable<
  DatabaseRecord extends Record<
    string,
    string | number | boolean | Date | null
  >,
> {
  private readonly _indexes: Array<keyof DatabaseRecord>;
  private readonly _key: keyof DatabaseRecord;
  private readonly _database: Datastore;
  private constructor(
    indexes: Array<keyof DatabaseRecord>,
    key: keyof DatabaseRecord,
    database: Datastore,
  ) {
    this._indexes = indexes;
    this._key = key;
    this._database = database;
  }

  public static async build<
    DatabaseRecord extends Record<
      string,
      string | number | boolean | Date | null
    >,
  >(
    name: string,
    indexes: Array<keyof DatabaseRecord>,
    key: keyof DatabaseRecord,
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

    async function index(fieldName: keyof DatabaseRecord): Promise<void> {
      await database
        .ensureIndexAsync({ fieldName: fieldName as string, unique: true })
        .catch((error) => {
          throw new Common.DatabaseCommonError({
            cause: error,
          });
        });
    }
    await Promise.all(
      indexes.map(async (fieldName: keyof DatabaseRecord) => {
        await index(fieldName);
      }),
    );

    return new DatabaseTable(indexes, key, database);
  }

  public async clean(): Promise<void> {
    const query1: Record<string, unknown> = {};
    query1[this._key as string] = { $exists: false };
    const query2: Record<string, unknown> = {};
    query2[this._key as string] = null;
    const query: Record<string, unknown> = { $or: [query1, query2] };
    try {
      await this._database.removeAsync(query, { multi: true });
      await this._database.compactDatafileAsync();
    } catch (error) {
      throw new Common.DatabaseCommonError({ cause: error });
    }
  }

  public async deleteRecord(
    query: OneOf<DatabaseRecord> | Array<OneOf<DatabaseRecord>>,
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
    query:
      | OneOf<Required<DatabaseRecord>>
      | Array<OneOf<Required<DatabaseRecord>>>,
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
    query?:
      | OneOf<Required<DatabaseRecord>>
      | Array<OneOf<Required<DatabaseRecord>>>,
  ): Promise<DatabaseRecord[]> {
    let records: Array<Record<string, unknown>>;
    try {
      records = await this._database
        .findAsync(Array.isArray(query) ? { $and: query } : query ?? {})
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
    query:
      | OneOf<Required<DatabaseRecord>>
      | Array<OneOf<Required<DatabaseRecord>>>,
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
    query:
      | OneOf<Required<DatabaseRecord>>
      | Array<OneOf<Required<DatabaseRecord>>>,
    fields:
      | OneOf<Required<DatabaseRecord>>
      | Array<OneOf<Required<DatabaseRecord>>>,
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
