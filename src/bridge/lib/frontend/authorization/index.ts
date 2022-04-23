
import * as fs from 'fs'
import * as path from 'path'
import * as Common from '../../../../common'
import { JwtPayload } from 'jsonwebtoken'

export class Authorization {
  private readonly _x509Cert: Buffer
  private readonly _hostname: string
  private readonly _authorizedEmails: string[]
  public constructor (hostname: string, authorizedEmails: string[]) {
    this._x509Cert = fs.readFileSync(path.join(__dirname, Common.constants.bridge.jwt.x509CertificateFile))
    this._hostname = hostname
    this._authorizedEmails = authorizedEmails
  }

  public x509Cert (): Buffer {
    return this._x509Cert
  }

  public authorize (jwtPayload: JwtPayload): boolean {
    const that = this

    Common.Debug.debugJSON(jwtPayload)
    if (typeof jwtPayload.iss === 'undefined') {
      Common.Debug.debug('payload.iss failed: missing')
      return false
    }
    if (jwtPayload.iss !== Common.constants.bridge.jwt.iss) {
      Common.Debug.debug(`payload.iss failed: ${jwtPayload.iss} ${Common.constants.bridge.jwt.iss}`)
      return false
    }
    if (typeof jwtPayload.sub === 'undefined') {
      Common.Debug.debug('payload.sub failed: missing')
      return false
    }
    const found = that._authorizedEmails.find((authorizedEmail) => (jwtPayload.sub === authorizedEmail))
    if (typeof found === 'undefined') {
      Common.Debug.debug('payload.sub failed')
      return false
    }
    if (typeof jwtPayload.aud === 'undefined') {
      Common.Debug.debug('payload.aud failed: missing')
      return false
    }
    if (jwtPayload.aud !== `https://${that._hostname}/`) {
      Common.Debug.debug(`payload.sub failed ${jwtPayload.aud} https://${that._hostname}/`)
      return false
    }

    return true
  }
}
