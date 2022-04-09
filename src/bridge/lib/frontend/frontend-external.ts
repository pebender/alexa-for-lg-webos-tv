//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { BaseClass } from '../base-class'
import { FrontendSecurity } from './frontend-security'
import { SmartHomeSkill } from '../smart-home-skill'
import express from 'express'
import expressCore from 'express-serve-static-core'
const basicAuth = require('express-basic-auth')

export class FrontendExternal extends BaseClass {
  private readonly _security: FrontendSecurity
  private readonly _smartHomeSkill: SmartHomeSkill
  private readonly _server: expressCore.Express
  public constructor (serverSecurity: FrontendSecurity, smartHomeSkill: SmartHomeSkill) {
    super()

    this._security = serverSecurity
    this._smartHomeSkill = smartHomeSkill
    this._server = express()
  }

  public initialize (): Promise<void> {
    const that = this

    function authorizeUser (username: string, password: string): Promise<boolean> {
      return that._security.authorizeUser(username, password)
    }

    async function backendSkillHandler (request: express.Request, response: express.Response): Promise<void> {
      if (typeof request.body.log !== 'undefined') {
        console.log(JSON.stringify(request.body, null, 2))
        response
          .type('json')
          .status(200)
          .json({})
          .end()
        return
      }
      const commandResponse = await that._smartHomeSkill.handler(request.body)
      response
        .type('json')
        .status(200)
        .json(commandResponse)
        .end()
    }

    function backendPingHandler (_request: expressCore.Request, response: expressCore.Response): void {
      response
        .status(200)
        .end()
    }

    function initializeFunction (): Promise<void> {
      return new Promise<void>((resolve): void => {
        that._server.use('/', express.json())
        that._server.use('/LGTV', basicAuth({ authorizer: authorizeUser }))
        that._server.post('/LGTV/SKILL', backendSkillHandler)
        that._server.get('/LGTV/PING', backendPingHandler)
        that._server.post('/', (_req: expressCore.Request, res: expressCore.Response): void => {
          res.status(401).end()
        })
        resolve()
      })
    }
    return this.initializeHandler(initializeFunction)
  }

  public start (): void {
    this.throwIfUninitialized('start')
    this._server.listen(25391, 'localhost')
  }
}
