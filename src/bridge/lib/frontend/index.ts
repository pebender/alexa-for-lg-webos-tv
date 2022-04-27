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
import { URL } from "url";
import * as Common from "../../../common";
import { BaseClass } from "../base-class";
import { Configuration } from "../configuration";
import { Middle } from "../middle";
import { Authorization } from "./authorization";
const IPBlacklist = require("@outofsync/express-ip-blacklist");

export class Frontend extends BaseClass {
  private readonly _authorization: Authorization;
  private readonly _middle: Middle;
  private readonly _ipBlacklist;
  private readonly _ajv: Ajv;
  private readonly _schemaValidator: AjvTypes.ValidateFunction;
  private readonly _server: express.Express;
  public constructor(configuration: Configuration, middle: Middle) {
    super();

    this._authorization = new Authorization(configuration);
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
    function buildServer() {
      function requestHeaderLoggingHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): void {
        Common.Debug.debug("HTTP request headers:");
        Common.Debug.debug(`hostname: ${req.hostname}`);
        Common.Debug.debug(`path: ${req.path}`);
        Common.Debug.debug(`method: ${req.method}`);
        Common.Debug.debugJSON(req.headers);
        next();
      }

      function ipBlacklistHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): void {
        that._ipBlacklist.checkBlacklist(req, res, next);
      }

      function ipBlacklistIncrement(
        req: express.Request,
        res: express.Response
      ): void {
        that._ipBlacklist.increment(req, res);
      }

      function jwtErrorHandler(
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): void {
        if (res.headersSent) {
          return next(err);
        }

        if (err) {
          ipBlacklistIncrement(req, res);
          Common.Debug.debug("jwtErrorHandler: Failed Validation:");
          Common.Debug.debugError(err);
          res.status(401).json({});
          return;
        }

        next(err);
      }

      async function jwtPayloadHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) {
        const jwtPayload = (req as unknown as ExpressJwtRequest).auth;

        if (typeof jwtPayload === "undefined") {
          ipBlacklistIncrement(req, res);
          Common.Debug.debug("jwtPayloadHandler: error: no 'req.auth'.");
          res.status(401).json({}).end();
          return;
        }

        Common.Debug.debugJSON(jwtPayload);

        if (!that._authorization.authorizeJwTPayload(jwtPayload)) {
          ipBlacklistIncrement(req, res);
          Common.Debug.debug("jwtPayloadHandler: failed authorization");
          res.status(401).json({});
          return;
        }

        const bridgeToken = that._authorization.generateBridgeToken();
        if (typeof jwtPayload.sub !== "string") {
          res.status(500).json({});
          return;
        }
        const email = jwtPayload.sub;
        if (typeof jwtPayload.aud !== "string") {
          res.status(500).json({});
          return;
        }
        const url = new URL(jwtPayload.aud);
        const hostname = url.hostname;
        try {
          await that._authorization.setBridgeToken(
            email,
            hostname,
            bridgeToken
          );
        } catch (error) {
          res.status(500).json({});
          return;
        }

        res.status(200).json({
          token: bridgeToken,
        });
      }

      async function bridgeTokenAuthorizationHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): Promise<void> {
        Common.Debug.debug("bridgeTokenAuthorizationHandler: start");
        function shsInvalidAuthorizationCredentialResponse(message: string) {
          return new Common.SHS.Response({
            namespace: "Alexa",
            name: "ErrorResponse",
            payload: {
              type: "INVALID_AUTHORIZATION_CREDENTIAL",
              message,
            },
          });
        }
        // Extract bridgeToken from "authorization" header. RFC-6750 allows
        // for the Bearer token to be included in the "authorization" header, as
        // part part of the URL or in the body. Since we put it in the header, we
        // know that is were it will be. Pre RFC-6750, failure to find the Bearer
        // token results 401 response that includes a "WWW-Authenticate" header.
        const wwwAuthenticate = `Bearer realm="https://${Common.constants.bridge.path.skill}"`;
        if (req.headers.authorization === "undefined") {
          ipBlacklistIncrement(req, res);
          const body = shsInvalidAuthorizationCredentialResponse(
            'Bridge connection failed due to missing "authorization" header.'
          );
          Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
          Common.Debug.debugJSON(body);
          res
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json(body);
          return;
        }
        const authorization = (req.headers.authorization as string).split(
          /\s+/
        );
        if (authorization.length !== 2) {
          ipBlacklistIncrement(req, res);
          const body = shsInvalidAuthorizationCredentialResponse(
            'Bridge connection failed due to malformed "authorization" header.'
          );
          Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
          Common.Debug.debugJSON(body);
          res
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json(body);
          return;
        }
        if (authorization[0].toLowerCase() !== "bearer") {
          ipBlacklistIncrement(req, res);
          const body = shsInvalidAuthorizationCredentialResponse(
            "Bridge connection failed due to incorrect authorization method."
          );
          Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
          Common.Debug.debugJSON(body);
          res
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json(body);
          return;
        }
        const bridgeToken = authorization[1];

        try {
          const authorized = await that._authorization.authorizeBridgeToken(
            bridgeToken
          );
          if (!authorized) {
            ipBlacklistIncrement(req, res);
            const body = shsInvalidAuthorizationCredentialResponse(
              "Bridge connection failed due to invalid bearer token."
            );
            res
              .setHeader("WWW-Authenticate", wwwAuthenticate)
              .status(401)
              .json(body)
              .send();
            return;
          }
        } catch (error) {
          Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
          Common.Debug.debugError(error);
          res.status(500).json({});
          return;
        }
        Common.Debug.debug("bridgeTokenAuthorizationHandler: success");
        next();
      }

      function requestTypeHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): void {
        if (req.method !== "POST") {
          ipBlacklistIncrement(req, res);
          res.status(405).json({});
          return;
        }
        const contentType = req.headers["content-type"];
        if (typeof contentType === "undefined") {
          ipBlacklistIncrement(req, res);
          res.status(400).json({});
          return;
        }
        if (!/^application\/json/.test((contentType as string).toLowerCase())) {
          ipBlacklistIncrement(req, res);
          res.status(415).json({});
          return;
        }
        next();
      }

      async function shsHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): Promise<void> {
        const shsRequest = req.body;
        Common.Debug.debug("Smart Home Skill Request:");
        Common.Debug.debugJSON(shsRequest);

        let shsResponse: Common.SHS.Response;
        let statusCode: number;
        try {
          shsResponse = await that._middle.handler(shsRequest);
          statusCode = 200;
        } catch (error) {
          const shsError = error as Common.SHS.Error;
          shsResponse = shsError.response;
          statusCode =
            typeof shsError.httpStatusCode !== "undefined"
              ? shsError.httpStatusCode
              : 500;
        }
        Common.Debug.debug("Smart Home Skill Response:");
        Common.Debug.debug(`statusCode: ${statusCode}`);
        Common.Debug.debugJSON(shsResponse);

        // Check SHS Response against the SHS schema.
        try {
          const valid = await that._schemaValidator(shsResponse);
          if (!valid) {
            Common.Debug.debug(
              "Smart Home Skill Response schema validation validation"
            );
            Common.Debug.debugJSON(that._schemaValidator.errors);
          } else {
            Common.Debug.debug(
              "Smart Home Skill Response schema validation passed"
            );
          }
        } catch (error) {
          Common.Debug.debug(
            "Smart Home Skill Response schema validation error:"
          );
          Common.Debug.debugError(error);
        }

        res.status(statusCode).json(shsResponse);
      }

      // Log request message
      that._server.use(requestHeaderLoggingHandler);
      // Check the IP address blacklist.
      that._server.use(ipBlacklistHandler);
      // Handle exchange of JWT for bridgeToken.
      that._server.use(
        Common.constants.bridge.path.login,
        expressjwt({
          secret: that._authorization.x509PublicCert(),
          algorithms: ["RS256"],
        }),
        jwtErrorHandler,
        jwtPayloadHandler
      );
      // Handle Smart Home Skill directives.
      that._server.use(
        Common.constants.bridge.path.skill,
        bridgeTokenAuthorizationHandler,
        requestTypeHandler,
        express.json(),
        shsHandler
      );
      that._server.use((req: express.Request, res: express.Response): void => {
        res.status(404).json({});
      });
    }

    async function initializeFunction(): Promise<void> {
      await that._authorization.initialize();

      buildServer();
    }
    return that.initializeHandler(initializeFunction);
  }

  public start(): void {
    this.throwIfUninitialized("start");
    this._server.listen(Common.constants.bridge.port.http, "localhost");
  }
}
