//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import Ajv from "ajv/dist/2019";
import * as AjvTypes from "ajv";
import ajvFormats from "ajv-formats";
import express from "express";
import { expressjwt, ExpressJwtRequest } from "express-jwt";
import * as httpErrors from "http-errors";
import * as Common from "../../../common";
import { BaseClass } from "../base-class";
import { DatabaseTable } from "../database";
import { Middle } from "../middle";
import { Authorization } from "./authorization";
const IPBlacklist = require("@outofsync/express-ip-blacklist");
const { auth } = require("express-oauth2-bearer");

export class Frontend extends BaseClass {
  private readonly _authorization: Authorization;
  private readonly _middle: Middle;
  private readonly _ipBlacklist;
  private readonly _ajv: Ajv;
  private readonly _schemaValidator: AjvTypes.ValidateFunction;
  private readonly _server: express.Express;
  public constructor(
    hostname: string,
    authorizedEmails: string[],
    frontendDb: DatabaseTable,
    middle: Middle
  ) {
    super();

    this._authorization = new Authorization(
      hostname,
      authorizedEmails,
      frontendDb
    );
    this._middle = middle;

    // The blacklist is due to auth failures so blacklist quickly.
    // There should be no auth failures and each auth failure results
    // in sending a profile request to Amazon.
    this._ipBlacklist = new IPBlacklist("blacklist", { count: 5 });

    // 'strictTypes: false' suppresses the warning:
    //   strict mode: missing type "object" for keyword "additionalProperties"
    this._ajv = new Ajv({
      strictTypes: false,
      discriminator: true,
    });
    // ajv-formats does not support the following formats defined in draft-2019-09
    //   'idn-email', 'idn-hostname', 'iri', 'iri-reference'
    ajvFormats(this._ajv, [
      "date-time",
      "date",
      "time",
      "duration",
      "email",
      "hostname",
      "ipv4",
      "ipv6",
      "uri",
      "uri-reference",
      "uri-template",
      "uuid",
      "json-pointer",
      "relative-json-pointer",
      "regex",
    ]);
    this._schemaValidator = this._ajv.compile(Common.SHS.schema);
    this._server = express();
  }

  public initialize(): Promise<void> {
    const that = this;

    function checkBlacklist(
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      return that._ipBlacklist.checkBlacklist(req, res, next);
    }

    function handleJwtError(
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      if (res.headersSent) {
        return next(err);
      }

      if (err) {
        that._ipBlacklist.increment(req, res);
        Common.Debug.debug("handleJwtError: Failed Validation:");
        Common.Debug.debugError(err);
        res.status(401).json({}).end();
        return;
      }

      next(err);
    }

    async function handleJwtPayload(
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) {
      const jwtPayload = (req as unknown as ExpressJwtRequest).auth;

      if (typeof jwtPayload === "undefined") {
        that._ipBlacklist.increment(req, res);
        Common.Debug.debug("handleJwtPayload: error: no 'req.auth'.");
        res.status(401).json({}).end();
        return;
      }

      Common.Debug.debugJSON(jwtPayload);

      if (!that._authorization.authorizeJwTPayload(jwtPayload)) {
        that._ipBlacklist.increment(req, res);
        Common.Debug.debug("handleJwtPayload: failed authorization");
        res.status(401).json({}).end();
        return;
      }

      const bridgeToken = that._authorization.generateBridgeToken();
      if (typeof jwtPayload.sub === "undefined") {
        res.status(500).json({}).end();
        return;
      }
      try {
        await that._authorization.setBridgeToken(jwtPayload.sub, bridgeToken);
      } catch (error) {
        res.status(500).json({}).end();
        return;
      }

      res
        .status(200)
        .json({
          token: bridgeToken,
        })
        .end();
    }

    async function authorizeBridgeToken(token: string): Promise<any> {
      try {
        const authorized = await that._authorization.authorizeBridgeToken(
          token
        );
        if (!authorized) {
          return;
        }
        return token;
      } catch (error) {
        Common.Debug.debug("authorizeBridgeToken");
        Common.Debug.debugError(error);
      }
    }

    async function handleBridgeTokenError(
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      if (res.headersSent) {
        return next(err);
      }
      if (!httpErrors.isHttpError(err)) {
        return next(err);
      }
      that._ipBlacklist.increment(req, res);
      const response = new Common.SHS.Response({
        namespace: "Alexa",
        name: "ErrorResponse",
        payload: {
          type: "INVALID_AUTHORIZATION_CREDENTIAL",
          message:
            "Bridge connection failed due to invalid authorization credentials.",
        },
      });

      Common.Debug.debug("failed authorization");
      res.status(200).json(response).end();
    }

    async function backendSHSHandler(
      request: express.Request,
      response: express.Response
    ): Promise<void> {
      try {
        Common.Debug.debug("request message");
        Common.Debug.debugJSON(request.body);
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

        const commandResponse = await that._middle.handler(request.body);
        Common.Debug.debug("response message");
        Common.Debug.debugJSON(commandResponse);
        const valid = await that._schemaValidator(commandResponse);
        if (!valid) {
          Common.Debug.debug("response message is invalid");
          Common.Debug.debugJSON(that._schemaValidator.errors);
        } else {
          Common.Debug.debug("response message is valid");
        }
        response.type("json").status(200).json(commandResponse).end();
      } catch (error) {
        const shsError = error as Common.SHS.Error;
        const commandResponse = shsError.response;

        const statusCode =
          typeof shsError.httpStatusCode !== "undefined"
            ? shsError.httpStatusCode
            : 500;
        response.type("json").status(statusCode).json(commandResponse).end();
      }
    }

    function initializeFunction(): Promise<void> {
      return new Promise<void>((resolve): void => {
        that._server.use((req, res, next) => {
          Common.Debug.debug("express request:");
          Common.Debug.debug(`hostname: ${req.hostname}`);
          Common.Debug.debug(`path: ${req.path}`);
          Common.Debug.debug(`method: ${req.method}`);
          Common.Debug.debugJSON(req.headers);
          next();
        });
        // Check the IP address blacklist.
        that._server.use(checkBlacklist);
        that._server.use(
          Common.constants.bridge.path.login,
          expressjwt({
            secret: that._authorization.x509PublicCert(),
            algorithms: ["RS256"],
          }),
          handleJwtError,
          handleJwtPayload
        );
        that._server.use(
          Common.constants.bridge.path.skill,
          auth(authorizeBridgeToken),
          handleBridgeTokenError,
          (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
          ) => {
            if (req.method !== "POST") {
              return res.json().send(405);
            }
            const contentType = req.headers["content-type"];
            if (typeof contentType === "undefined") {
              return res.json().send(400);
            }
            if (
              !/^application\/json/.test((contentType as string).toLowerCase())
            ) {
              return res.json().send(415);
            }
            next();
          },
          express.json(),
          backendSHSHandler
        );
        that._server.use(
          (req: express.Request, res: express.Response): void => {
            res.status(500).end();
          }
        );
        resolve();
      });
    }
    return this.initializeHandler(initializeFunction);
  }

  public start(): void {
    this.throwIfUninitialized("start");
    this._server.listen(Common.constants.bridge.port.http, "localhost");
  }
}
