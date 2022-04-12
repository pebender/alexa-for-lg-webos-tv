
import { BaseClass } from '../base-class'
import { constants } from '../../../common/constants'
import { DatabaseTable } from '../database'
import * as https from 'https'

export class FrontendAuthorization extends BaseClass {
  private readonly _db: DatabaseTable
  public constructor (frontendDb: DatabaseTable) {
    super()

    this._db = frontendDb
  }

  public initialize (): Promise<void> {
    return this.initializeHandler(() => Promise.resolve())
  }

  public async authorize (bearerToken: string | null): Promise<boolean> {
    if (bearerToken === null) {
      return false
    }

    async function getUserProfile (bearerToken: string): Promise<any> {
      return new Promise((resolve, reject) => {
        const options = {
          method: 'GET',
          hostname: 'api.amazon.com',
          path: '/user/profile',
          headers: {
            Authorization: `Bearer ${bearerToken}`
          }
        }
        const req = https.request(options, (response) => {
          let returnData = ''

          response.on('data', (chunk) => {
            returnData += chunk
          })

          response.on('end', () => {
            resolve(JSON.parse(returnData))
          })

          response.on('error', (error) => {
            reject(error)
          })
        })
        req.end()
      })
    }

    const record = await this._db.getRecord({ bearerToken })
    if (record === null) {
      const userProfile = await getUserProfile(bearerToken)
      if ((!('user_id' in userProfile)) || (!('email' in userProfile))) {
        return false
      }
      const userId = userProfile.user_id
      const email = userProfile.email

      const found = constants.user.emails.find((element) => (element === email))
      if (typeof found === 'undefined') {
        return false
      }

      await this._db.updateOrInsertRecord({ email }, { email, userId, bearerToken })
    }

    return true
  }
}
