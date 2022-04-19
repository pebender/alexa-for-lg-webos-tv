//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import * as Common from '../../../common'
import { BaseClass } from '../base-class'
import { FrontendAuthorization } from './frontend-authorization'
import { SmartHomeSkill } from '../smart-home-skill'
import Ajv from 'ajv/dist/2019'
import * as AjvTypes from 'ajv'
import ajvFormats from 'ajv-formats'
import express from 'express'
import expressCore from 'express-serve-static-core'
import * as httpErrors from 'http-errors'
const { auth } = require('express-oauth2-bearer')

export class FrontendExternal extends BaseClass {
  private readonly _authorization: FrontendAuthorization
  private readonly _smartHomeSkill: SmartHomeSkill
  private readonly _ajv: Ajv
  private readonly _schemaValidator: AjvTypes.ValidateFunction
  private readonly _server: expressCore.Express
  public constructor (frontendAuthorization: FrontendAuthorization, smartHomeSkill: SmartHomeSkill) {
    super()

    this._authorization = frontendAuthorization
    this._smartHomeSkill = smartHomeSkill
    // 'strictTypes: false' suppresses the warning:
    //   strict mode: missing type "object" for keyword "additionalProperties"
    this._ajv = new Ajv({
      strictTypes: false,
      discriminator: true
    })
    // ajv-formats does not support the following formats defined in draft-2019-09
    //   'idn-email', 'idn-hostname', 'iri', 'iri-reference'
    ajvFormats(this._ajv, [
      'date-time',
      'date',
      'time',
      'duration',
      'email',
      'hostname',
      'ipv4',
      'ipv6',
      'uri',
      'uri-reference',
      'uri-template',
      'uuid',
      'json-pointer',
      'relative-json-pointer',
      'regex'
    ])
    this._schemaValidator = this._ajv.compile(Common.SHS.schema)
    this._server = express()
  }

  public initialize (): Promise<void> {
    const that = this

    // Alexa Smart Home (ASH) skill hand1er.
    async function backendASHHandler (request: express.Request, response: express.Response): Promise<void> {
      try {
        Common.Debug.debug('request message')
        Common.Debug.debugJSON(request.body)
        // schema used for validation does not support request messages.
        /*
        const valid = await that._schemaValidator(request.body)
        if (!valid) {
          Common.Debug.debug('response message is invalid')
          Common.Debug.debug(that._schemaValidator.errors)
        } else {
          Common.Debug.debug('response message is valid')
        }
        */

        const commandResponse = await that._smartHomeSkill.handler(request.body)
        Common.Debug.debug('response message')
        Common.Debug.debugJSON(commandResponse)
        const valid = await that._schemaValidator(commandResponse)
        if (!valid) {
          Common.Debug.debug('response message is invalid')
          Common.Debug.debugJSON(that._schemaValidator.errors)
        } else {
          Common.Debug.debug('response message is valid')
        }
        response
          .type('json')
          .status(200)
          .json(commandResponse)
          .end()
      } catch (error) {
        const alexaError = (error as Common.SHS.AlexaError)
        const commandResponse = alexaError.response

        const statusCode = (typeof alexaError.httpStatusCode !== 'undefined') ? alexaError.httpStatusCode : 500
        response
          .type('json')
          .status(statusCode)
          .json(commandResponse)
          .end()
      }
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
        that._server.post(`/${Common.constants.bridge.path}`, backendASHHandler)
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
    this._server.listen(Common.constants.bridge.port.http, 'localhost')
  }
}
