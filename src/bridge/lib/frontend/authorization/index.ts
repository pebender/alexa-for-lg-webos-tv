
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { JwtPayload } from 'jsonwebtoken'
import * as Common from '../../../../common'
import { DatabaseRecord, DatabaseTable } from '../../database'

export class Authorization {
  private readonly _x509PublicCert: Buffer
  private readonly _hostname: string
  private readonly _authorizedEmails: string[]
  private readonly _db: DatabaseTable
  public constructor (hostname: string, authorizedEmails: string[], frontendDb: DatabaseTable) {
    this._x509PublicCert = fs.readFileSync(path.join(__dirname, Common.constants.bridge.jwt.x509PublicCertFile))
    this._hostname = hostname
    this._authorizedEmails = authorizedEmails
    this._db = frontendDb
  }

  public x509PublicCert (): Buffer {
    return this._x509PublicCert
  }

  public authorizeJwTPayload (jwtPayload: JwtPayload): boolean {
    const that = this

    Common.Debug.debug('authorizeJwTPayload:')
    Common.Debug.debugJSON(jwtPayload)
    if (typeof jwtPayload.iss === 'undefined') {
      Common.Debug.debug('jwtPayload.iss failed: missing')
      return false
    }
    if (jwtPayload.iss !== Common.constants.bridge.jwt.iss) {
      Common.Debug.debug(`jwtPayload.iss failed: ${jwtPayload.iss} ${Common.constants.bridge.jwt.iss}`)
      return false
    }
    if (typeof jwtPayload.sub === 'undefined') {
      Common.Debug.debug('jwtPayload.sub failed: missing')
      return false
    }
    const found = that._authorizedEmails.find((authorizedEmail) => (jwtPayload.sub === authorizedEmail))
    if (typeof found === 'undefined') {
      Common.Debug.debug('jwtPayload.sub failed')
      return false
    }
    if (typeof jwtPayload.aud === 'undefined') {
      Common.Debug.debug('jwtPayload.aud failed: missing')
      return false
    }
    if (jwtPayload.aud !== `https://${that._hostname}${Common.constants.bridge.path.skill}`) {
      Common.Debug.debug(`jwtPayload.sub failed ${jwtPayload.aud} https://${that._hostname}${Common.constants.bridge.path.skill}`)
      return false
    }

    return true
  }

  public generateBridgeToken (): string {
    return crypto.randomBytes(1000).toString('base64').slice(0, 1000)
  }

  public async setBridgeToken (email: string, bridgeToken: string): Promise<void> {
    try {
      await this._db.updateOrInsertRecord({ email }, { email, bridgeToken })
    } catch (error) {
      throw Common.SHS.Error.errorResponseFromError(null, error)
    }
  }

  public async authorizeBridgeToken (bridgeToken: string): Promise<boolean> {
    let record: DatabaseRecord | null
    try {
      record = await this._db.getRecord({ bridgeToken })
    } catch (error) {
      throw Common.SHS.Error.errorResponseFromError(null, error)
    }
    if (record === null) {
      return false
    }
    return true
  }
}
