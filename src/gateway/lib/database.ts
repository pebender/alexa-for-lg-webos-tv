import { BaseClass } from './base-class'
import Datastore from '@seald-io/nedb'

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
  private _indexes: string[]
  private _key: string
  private _db: Datastore
  public constructor (path: string, name: string, indexes: string[], key: string) {
    super()

    this._indexes = indexes
    this._key = key

    //
    // This operation is synchronous. It is both expected and desired because it
    // occurs once at startup and because the database is needed before the LG
    // webOS TV gateway can run.
    //
    this._db = new Datastore({ filename: `${path}/${name}.nedb` })
    this._db.loadDatabase((error): void => {
      if (error) {
        throw error
      }
    })
  }

  public initialize (): Promise<void> {
    const that = this
    function initializeFunction (): Promise<void> {
      return new Promise<void>((resolve): void => {
        that._indexes.forEach((record): void => {
          that._db.ensureIndex({
            fieldName: record,
            unique: true
          })
        })
        resolve()
      })
    }
    return this.initializeHandler(initializeFunction)
  }

  public async clean (): Promise<void> {
    this.throwIfUninitialized('clean')
    const that = this
    const query1: DatabaseQuery = {}
    query1[this._key] = { $exists: false }
    const query2: DatabaseQuery = {}
    query2[this._key] = null
    const query: DatabaseQuery = { $or: [query1, query2] }
    await new Promise<void>((resolve, reject): void => {
      that._db.remove(
        query,
        { multi: true },
        (error): void => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        }
      )
    })
  }

  public async getRecord (query: DatabaseQuery): Promise<DatabaseRecord> {
    this.throwIfUninitialized('getRecord')
    const that = this
    const record = await new Promise<DatabaseRecord>((resolve, reject): void => {
      that._db.findOne(
        query,
        (err, doc: DatabaseRecord): void => {
          if (err) {
            reject(err)
            return
          }
          resolve(doc)
        }
      )
    })
    return record
  }

  public async getRecords (query: DatabaseQuery): Promise<DatabaseRecord[]> {
    this.throwIfUninitialized('getRecords')
    const that = this
    const records = await new Promise<DatabaseRecord[]>((resolve, reject): void => {
      that._db.find(
        query,
        (error: Error, docs: DatabaseRecord[]): void => {
          if (error) {
            reject(error)
            return
          }
          resolve(docs)
        }
      )
    })
    return records
  }

  public async insertRecord (record: DatabaseRecord): Promise<void> {
    this.throwIfUninitialized('insertRecord')
    const that = this
    await new Promise<void>((resolve, reject): void => {
      that._db.insert(record, (error): void => {
        if (error) {
          reject(error)
          return
        }
        resolve()
        // eslint-disable-next-line no-useless-return
        return
      })
    })
  }

  public async updateRecord (query: DatabaseQuery, update: DatabaseUpdate): Promise<void> {
    this.throwIfUninitialized('updateRecord')
    const that = this
    await new Promise<void>((resolve, reject): void => {
      that._db.update(
        query,
        update,
        {},
        (error): void => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        }
      )
    })
  }

  public async updateOrInsertRecord (query: DatabaseQuery, update: DatabaseUpdate): Promise<void> {
    this.throwIfUninitialized('updateOrInsertRecord')
    const that = this
    await new Promise<void>((resolve, reject): void => {
      that._db.update(
        query,
        update,
        { upsert: true },
        (error): void => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        }
      )
    })
  }
}
