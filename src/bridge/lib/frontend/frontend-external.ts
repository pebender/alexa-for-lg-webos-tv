//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { BaseClass } from '../base-class'
import { constants } from '../../../common/constants'
import { SmartHomeSkill } from '../skill'
import express from 'express'
import expressCore from 'express-serve-static-core'

export class FrontendExternal extends BaseClass {
  private readonly _smartHomeSkill: SmartHomeSkill
  private readonly _server: expressCore.Express
  public constructor (smartHomeSkill: SmartHomeSkill) {
    super()

    this._smartHomeSkill = smartHomeSkill
    this._server = express()
  }

  public initialize (): Promise<void> {
    const that = this

    async function backendSkillHandler (request: express.Request, response: express.Response): Promise<void> {
      console.log(JSON.stringify(request.body, null, 2))
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

    function initializeFunction (): Promise<void> {
      return new Promise<void>((resolve): void => {
        that._server.use('/', express.json())
        that._server.post(`/${constants.application.name.safe}`, backendSkillHandler)
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
