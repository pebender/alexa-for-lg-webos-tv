
import * as Common from '../../../common'
import { Authorization } from './authorization'
import { Backend } from '../backend'
import { DatabaseTable } from '../database'
import * as SHS from './smart-home-skill'

export class Middle {
  private readonly _authorization: Authorization
  private readonly _backend: Backend
  public constructor (authorizedEmails: string[], middleDb: DatabaseTable, backend: Backend) {
    this._authorization = new Authorization(authorizedEmails, middleDb)
    this._backend = backend
  }

  public async handler (alexaRequest: Common.SHS.Request): Promise<Common.SHS.Response> {
    return await SHS.handler(alexaRequest, this._authorization, this._backend)
  }
}
