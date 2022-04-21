
import { BaseClass } from '../base-class'
import { DatabaseRecord, DatabaseTable } from '../database'
import * as Common from '../../../common'
export class FrontendAuthorization extends BaseClass {
  private readonly _authorizedEmails: string[]

  private readonly _db: DatabaseTable
  public constructor (authorizedEmails: string[], frontendDb: DatabaseTable) {
    super()

    this._authorizedEmails = authorizedEmails
    this._db = frontendDb
  }

  public initialize (): Promise<void> {
    return this.initializeHandler(() => Promise.resolve())
  }

  public async authorize (bearerToken: string): Promise<boolean> {
    let record: DatabaseRecord | null
    try {
      record = await this._db.getRecord({ bearerToken })
    } catch (error) {
      throw Common.SHS.Error.errorResponseFromError(null, error)
    }
    if (record === null) {
      const profile = await Common.Profile.SHS.getUserProfile(bearerToken)
      const userId = profile.user_id
      const email = profile.email

      const found = this._authorizedEmails.find((element) => (element === email))
      if (typeof found === 'undefined') {
        return false
      }
      try {
        await this._db.updateOrInsertRecord({ email }, { email, userId, bearerToken })
      } catch (error) {
        throw Common.SHS.Error.errorResponseFromError(null, error)
      }
    }

    return true
  }
}
