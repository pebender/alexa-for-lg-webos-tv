//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import Ajv from 'ajv/dist/2019'
import * as AjvTypes from 'ajv'
import ajvFormats from 'ajv-formats'
import express from 'express'
import { expressjwt, ExpressJwtRequest } from 'express-jwt'
import * as Common from '../../../common'
import { BaseClass } from '../base-class'
import { Middle } from '../middle'
import { Authorization } from './authorization'
const IPBlacklist = require('@outofsync/express-ip-blacklist')

export class Frontend extends BaseClass {
  private readonly _authorization: Authorization
  private readonly _middle: Middle
  private readonly _ipBlacklist
  private readonly _ajv: Ajv
  private readonly _schemaValidator: AjvTypes.ValidateFunction
  private readonly _server: express.Express
  public constructor (hostname: string, authorizedEmails: string[], middle: Middle) {
    super()

    this._authorization = new Authorization(hostname, authorizedEmails)
    this._middle = middle

    // The blacklist is due to auth failures so blacklist quickly.
    // There should be no auth failures and each auth failure results
    // in sending a profile request to Amazon.
    this._ipBlacklist = new IPBlacklist('blacklist', { count: 5 })

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

    function checkBlacklist (req: express.Request, res: express.Response, next: express.NextFunction) {
      return that._ipBlacklist.checkBlacklist(req, res, next)
    }

    function handleJwtError (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      if (res.headersSent) {
        return next(err)
      }

      if (err) {
        that._ipBlacklist.increment(req, res)

        Common.Debug.debug('handlerJwtError 1')
        const response = new Common.SHS.Response({
          namespace: 'Alexa',
          name: 'ErrorResponse',
          payload: {
            type: 'INVALID_AUTHORIZATION_CREDENTIAL',
            message: 'Bridge connection failed due to invalid authorization credentials.'
          }
        })

        Common.Debug.debug('failed signature')
        res.status(200)
          .json(response)
          .end()
        return
      }

      next(err)
    }

    function handleJwtPayload (req: express.Request, res: express.Response, next: express.NextFunction) {
      const jwtPayload = ((req as unknown) as ExpressJwtRequest).auth

      if (typeof jwtPayload === 'undefined') {
        that._ipBlacklist.increment(req, res)

        Common.Debug.debug('handleJwtPayload 1')
        const response = new Common.SHS.Response({
          namespace: 'Alexa',
          name: 'ErrorResponse',
          payload: {
            type: 'INVALID_AUTHORIZATION_CREDENTIAL',
            message: 'Bridge connection failed due to invalid authorization credentials.'
          }
        })

        Common.Debug.debug('failed signature')
        res.status(200)
          .json(response)
          .end()
        return
      }

      if (!that._authorization.authorize(jwtPayload)) {
        that._ipBlacklist.increment(req, res)

        Common.Debug.debug('handleJwtPayload 2')
        const response = new Common.SHS.Response({
          namespace: 'Alexa',
          name: 'ErrorResponse',
          payload: {
            type: 'INVALID_AUTHORIZATION_CREDENTIAL',
            message: 'Bridge connection failed due to invalid authorization credentials.'
          }
        })

        Common.Debug.debug('failed authorization')
        res.status(200)
          .json(response)
          .end()
        return
      }

      next()
    }

    async function backendSHSHandler (request: express.Request, response: express.Response): Promise<void> {
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

        const commandResponse = await that._middle.handler(request.body)
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
        const shsError = (error as Common.SHS.Error)
        const commandResponse = shsError.response

        const statusCode = (typeof shsError.httpStatusCode !== 'undefined') ? shsError.httpStatusCode : 500
        response
          .type('json')
          .status(statusCode)
          .json(commandResponse)
          .end()
      }
    }

    function initializeFunction (): Promise<void> {
      return new Promise<void>((resolve): void => {
        // Check the IP address blacklist.
        that._server.use(checkBlacklist)
        that._server.use(
          expressjwt({
            secret: that._authorization.x509Cert(),
            algorithms: ['RS256']
          }),
          handleJwtError,
          handleJwtPayload
        )
        // Only accept POST requests and only access JSON content-type.
        that._server.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
          if (req.method !== 'POST') {
            return res.json().send(405)
          }
          const contentType = req.headers['content-type']
          if (typeof contentType === 'undefined') {
            return res.json().send(400)
          }
          if (!(/^application\/json/).test((contentType as string).toLowerCase())) {
            return res.json().send(415)
          }
          next()
        })
        // Parse the JSON content.
        that._server.use(express.json())
        that._server.post(`/${Common.constants.bridge.path.skill}`, backendSHSHandler)
        that._server.post('/', (_req: express.Request, res: express.Response): void => {
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
