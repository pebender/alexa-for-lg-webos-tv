import { BaseClass } from '../base-class'
import { DatabaseTable } from '../database'
import { constants } from '../../../common/constants'

export class FrontendSecurity extends BaseClass {
  private readonly _db: DatabaseTable
  public constructor (db: DatabaseTable) {
    super()

    this._db = db
  }

  public initialize (): Promise<void> {
    return this.initializeHandler((): Promise<void> => Promise.resolve())
  }

  public authorizeRoot (username: string, password: string): boolean {
    this.throwIfUninitialized('authorizeRoot')
    if (username === 'HTTP' && password === constants.bridgeRootPassword) {
      return true
    }
    return false
  }

  public async authorizeUser (username: string, password: string): Promise<boolean> {
    this.throwIfUninitialized('authorizeUser')
    const record = await this._db.getRecord({ name: 'password' })
    if (record === null || typeof record.value === 'undefined' || record.value === null) {
      return false
    }
    if (username === 'LGTV' && password === record.value) {
      return true
    }
    return false
  }

  public async userPasswordIsNull (): Promise<boolean> {
    this.throwIfUninitialized('userPasswordIsNull')
    const record = await this._db.getRecord({ name: 'password' })
    if (record === null || typeof record.value === 'undefined' || record.value === null) {
      return true
    }
    return false
  }

  public setUserPassword (password: string | null): Promise<void> {
    this.throwIfUninitialized('setUserPassword')
    return this._db.updateOrInsertRecord(
      { name: 'password' },
      {
        name: 'password',
        value: password
      }
    )
  }

  public async getHostname (): Promise<string> {
    this.throwIfUninitialized('getHostname')
    const record = await this._db.getRecord({ name: 'hostname' })
    if (typeof record.value !== 'string') {
      return ''
    }
    return record.value
  }

  public async setHostname (hostname: string): Promise<void> {
    this.throwIfUninitialized('setHostname')
    await this._db.updateOrInsertRecord(
      { name: 'hostname' },
      {
        name: 'hostname',
        value: hostname
      }
    )
  }
}
