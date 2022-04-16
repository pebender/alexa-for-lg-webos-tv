//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { BaseClass } from '../base-class'
import { constants } from '../../../common/constants'
import { FrontendAuthorization } from './frontend-authorization'
import { SmartHomeSkill } from '../skill'
import schema from '../../../common/alexa/alexa_smart_home_message_schema.json'
import * as ASH from '../../../common/alexa'
import Ajv from 'ajv'
import express from 'express'
import expressCore from 'express-serve-static-core'
import * as httpErrors from 'http-errors'
const { auth } = require('express-oauth2-bearer')

export class FrontendExternal extends BaseClass {
  private readonly _authorization: FrontendAuthorization
  private readonly _smartHomeSkill: SmartHomeSkill
  private readonly _ajv: Ajv.Ajv
  private readonly _schemaValidator: Ajv.ValidateFunction
  private readonly _server: expressCore.Express
  public constructor (frontendAuthorization: FrontendAuthorization, smartHomeSkill: SmartHomeSkill) {
    super()

    this._authorization = frontendAuthorization
    this._smartHomeSkill = smartHomeSkill
    this._ajv = new Ajv()
    this._schemaValidator = this._ajv.compile(schema)
    this._server = express()
  }

  public initialize (): Promise<void> {
    const that = this

    // Alexa Smart Home (ASH) skill hand1er.
    async function backendASHHandler (request: express.Request, response: express.Response): Promise<void> {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('request message')
          console.log(JSON.stringify(request.body, null, 2))
        }
        const commandResponse = await that._smartHomeSkill.handler(request.body)
        if (process.env.NODE_ENV === 'development') {
          console.log('response message')
          console.log(JSON.stringify(commandResponse, null, 2))
          const valid = await that._schemaValidator(commandResponse)
          if (!valid) {
            console.log('response message is invalid')
            console.log(that._schemaValidator.errors)
          } else {
            console.log('response message is valid')
          }
        }
        response
          .type('json')
          .status(200)
          .json(commandResponse)
          .end()
      } catch (error) {
        const alexaError = (error as ASH.AlexaError)
        console.log((alexaError as any).stack)
        const commandResponse = alexaError.response
        if (process.env.NODE_ENV === 'development') {
          console.log('error response message')
          console.log(JSON.stringify(commandResponse, null, 2))
          const valid = await that._schemaValidator(commandResponse)
          if (!valid) {
            console.log('error response message is invalid')
            console.log(that._schemaValidator.errors)
          } else {
            console.log('error response message is valid')
          }
        }
        const statusCode = (typeof alexaError.httpStatusCode !== 'undefined') ? alexaError.httpStatusCode : 500
        response
          .type('json')
          .status(statusCode)
          .json(commandResponse)
          .end()
      }
    }

    // Log message handler.
    async function backendLogHandler (request: express.Request, response: express.Response): Promise<void> {
      console.log(JSON.stringify(request.body, null, 2))
      response
        .type('json')
        .status(200)
        .json({})
        .end()
    }

    async function authorizeToken (token: string): Promise<any> {
      const authorized = await that._authorization.authorize(token)
      if (!authorized) {
        return
      }
      return token
    }

    async function handleAuthFailure (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      if (res.headersSent) {
        return next(err)
      }
      if (!httpErrors.isHttpError(err)) {
        return next(err)
      }
      const error = err as httpErrors.HttpError
      res.status(error.status)
      if (error.headers) {
        const headers = (error.headers as { [x: string]: string; })
        const keys = Object.keys(headers)
        keys.forEach((key: string): void => {
          res.header(key, headers[key])
        })
      }
      res.send()
    }

    function initializeFunction (): Promise<void> {
      return new Promise<void>((resolve): void => {
        that._server.use('/', express.json())
        that._server.use('/', auth(authorizeToken))
        that._server.use('/', handleAuthFailure)
        that._server.post(`/${constants.bridge.path.base}/${constants.bridge.path.relativeASH}`, backendASHHandler)
        that._server.post(`/${constants.bridge.path.base}/${constants.bridge.path.relativeLog}`, backendLogHandler)
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
    this._server.listen(constants.bridge.port.http, 'localhost')
  }
}
