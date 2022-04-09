import { BaseClass } from '../base-class'
import { DatabaseTable } from '../database'

export class FrontendSecurity extends BaseClass {
  private readonly _db: DatabaseTable
  public constructor (db: DatabaseTable) {
    super()

    this._db = db
  }

  public initialize (): Promise<void> {
    return this.initializeHandler((): Promise<void> => Promise.resolve())
  }

  public async authorizeUser (username: string, password: string): Promise<boolean> {
    this.throwIfUninitialized('authorizeUser')
    const record = await this._db.getRecord({ username })
    if (record === null ||
        typeof record.username === 'undefined' ||
        record.username === null ||
        typeof record.password === 'undefined' ||
        record.password === null) {
      return false
    }
    return true
  }

  public async passwordIsNull (username: string): Promise<boolean> {
    this.throwIfUninitialized('passwordIsNull')
    const record = await this._db.getRecord({ username })
    if (record === null || typeof record.password === 'undefined' || record.password === null) {
      return true
    }
    return false
  }

  public async getPassword (username: string): Promise<string | null> {
    this.throwIfUninitialized('getPassword')
    const record = await this._db.getRecord({ username })
    if (typeof record.password !== 'string') {
      return ''
    }
    return record.password
  }

  public setPassword (username: string, password: string | null): Promise<void> {
    this.throwIfUninitialized('setPassword')
    return this._db.updateOrInsertRecord(
      { username },
      {
        username,
        password
      }
    )
  }
}
