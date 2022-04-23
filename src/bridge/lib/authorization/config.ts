
import * as fs from 'fs'
import * as Common from '../../../common'
const persistPath = require('persist-path')

export class Config {
  private readonly _config: {
    hostname: string
    authorizedEmails: string[]
  }

  public constructor () {
    const configurationDir = persistPath(Common.constants.application.name.safe)
    const raw = fs.readFileSync(`${configurationDir}/config.json`)
    const rawConfig = JSON.parse(raw.toString())
    if (typeof rawConfig.hostname === 'undefined') {
      throw new Error(`'${configurationDir}/config.json': "hostname" is missing.`)
    }
    if (typeof rawConfig.hostname !== 'string') {
      throw new Error(`'${configurationDir}/config.json': "hostname" must be a string.`)
    }
    if (typeof rawConfig.authorizedEmails === 'undefined') {
      throw new Error(`'${configurationDir}/config.json': "authorizedEmails" is missing.`)
    }
    if (!Array.isArray(rawConfig.authorizedEmails)) {
      throw new Error(`'${configurationDir}/config.json': "authorizedEmails" must be an array.`)
    }
    this._config = rawConfig
  }

  public async getHostname (): Promise<string> {
    return this._config.hostname
  }

  public async getEmails (): Promise<string[]> {
    return this._config.authorizedEmails
  }
}
