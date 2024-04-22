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
import { Configuration } from "../configuration";
import { Middle } from "../middle";
import { Authorization } from "./authorization";
const IPBlacklist = require("@outofsync/express-ip-blacklist");

/**
 *
 * The Frontend class handles the communication link between the bridge and the
 * skill. It is an HTTP server that maintains three URL path-differentiated
 * communication links:
 *
 * - an authorization link
 *   - for skill and email address authorization, and
 *   - identified by the URL path given in the constant
 *     {@link Common.constants.bridge.path.login}),
 * - a test link
 *   - for testing whether or not the skill and email address are currently
 *     authorized,
 *   - identified by the URL path given in the constant
 *     {@link Common.constants.bridge.path.test}), and
 * - a skill link
 *   - for sending/receiving Alexa Smart Home Skill messages, and
 *   - identified by the URL path given in the constant
 *     {@link Common.constants.bridge.path.skill}).
 *
 * The frontend uses a bearer token to authorize HTTP messages sent on the test
 * link and the skill link.
 *
 * The frontend uses the authorization link to authorize the skill and the email
 * address and to establish the bearer token used to authorize HTTP messages
 * sent on the test link and the skill link. The skill sends a JWT (see
 * {@link https://datatracker.ietf.org/doc/html/rfc7519 | RFC7519}) containing
 * the bridge hostname and the email address and signed by the skill. The bridge
 * verifies the JWT, checks that the email address is authorized and creates the
 * bearer token. TODO: verify that the bridge hostname in the JWT matches the
 * bridge's hostname.
 */
export class Frontend {
  private readonly _authorization: Authorization;
  private readonly _middle: Middle;
  private readonly _ipBlacklist;
  private readonly _ajv: Ajv;
  private readonly _schemaValidator: AjvTypes.ValidateFunction;
  private readonly _server: express.Express;
  /**
   * The constructor is private. To instantiate a Frontend, use {@link Frontend.build}().
   */
  private constructor(
    _authorization: Authorization,
    _middle: Middle,
    _ipBlacklist: any,
    _ajv: Ajv,
    _schemaValidator: AjvTypes.ValidateFunction,
    _server: express.Express,
  ) {
    this._authorization = _authorization;
    this._middle = _middle;
    this._ipBlacklist = _ipBlacklist;
    this._ajv = _ajv;
    this._schemaValidator = this._ajv.compile(Common.SHS.schema);
    this._server = express();
  }

  public static async build(configuration: Configuration, middle: Middle) {
    const _authorization = await Authorization.build(configuration);

    // The blacklist is due to auth failures so blacklist quickly.
    // There should be no auth failures and each auth failure results
    // in sending a profile request to Amazon.
    const _ipBlacklist = new IPBlacklist("blacklist", { count: 5 });

    // 'strictTypes: false' suppresses the warning:
    //   strict mode: missing type "object" for keyword "additionalProperties"
    const _ajv = new Ajv({
      strictTypes: false,
      discriminator: true,
    });
    // ajv-formats does not support the following formats defined in draft-2019-09
    //   'idn-email', 'idn-hostname', 'iri', 'iri-reference'
    ajvFormats(_ajv, [
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
      "int32",
      "double",
      "regex",
    ]);
    const _schemaValidator = _ajv.compile(Common.SHS.schema);
    const _server = express();

    const frontend = new Frontend(
      _authorization,
      middle,
      _ipBlacklist,
      _ajv,
      _schemaValidator,
      _server,
    );

    function buildServer(): void {
      function requestHeaderLoggingHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
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
        next: express.NextFunction,
      ): void {
        Common.Debug.debug("ipBlacklistHandler: start");
        frontend._ipBlacklist.checkBlacklist(req, res, next);
        Common.Debug.debug("ipBlacklistHandler: end");
      }

      function ipBlacklistIncrement(
        req: express.Request,
        res: express.Response,
      ): void {
        Common.Debug.debug("ipBlacklistIncrement: start");
        frontend._ipBlacklist.increment(req, res);
      }

      function jwtErrorHandler(
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        Common.Debug.debug("jwtErrorHandler: start");
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
        next: express.NextFunction,
      ) {
        Common.Debug.debug("jwtPayloadHandler: start");
        const jwtPayload = (req as unknown as ExpressJwtRequest).auth;

        if (typeof jwtPayload === "undefined") {
          ipBlacklistIncrement(req, res);
          Common.Debug.debug("jwtPayloadHandler: error: no 'req.auth'.");
          res.status(401).json({}).end();
          return;
        }

        Common.Debug.debugJSON(jwtPayload);

        try {
          const authorized =
            frontend._authorization.authorizeJwTPayload(jwtPayload);
          if (!authorized) {
            ipBlacklistIncrement(req, res);
            Common.Debug.debug("jwtPayloadHandler: failed authorization");
            res.status(401).json({});
            return;
          }
        } catch (error) {
          res.status(500).json({});
        }

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
        const bridgeToken = frontend._authorization.generateBridgeToken();
        try {
          await frontend._authorization.setBridgeToken(
            email,
            hostname,
            bridgeToken,
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
        next: express.NextFunction,
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

        res.locals.email = null;

        // Extract bridgeToken from "authorization" header. RFC-6750 allows
        // for the Bearer token to be included in the "authorization" header, as
        // part part of the URL or in the body. Since we put it in the header, we
        // know that is were it will be. Pre RFC-6750, failure to find the Bearer
        // token results 401 response that includes a "WWW-Authenticate" header.
        const wwwAuthenticate = `Bearer realm="https://${Common.constants.bridge.path.skill}"`;
        if (req.headers.authorization === "undefined") {
          ipBlacklistIncrement(req, res);
          const body = shsInvalidAuthorizationCredentialResponse(
            'Bridge connection failed due to missing "authorization" header.',
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
          /\s+/,
        );
        if (authorization.length !== 2) {
          ipBlacklistIncrement(req, res);
          const body = shsInvalidAuthorizationCredentialResponse(
            'Bridge connection failed due to malformed "authorization" header.',
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
            "Bridge connection failed due to incorrect authorization method.",
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
          const email =
            await frontend._authorization.authorizeBridgeToken(bridgeToken);
          if (email === null) {
            ipBlacklistIncrement(req, res);
            const body = shsInvalidAuthorizationCredentialResponse(
              "Bridge connection failed due to invalid bearer token.",
            );
            res
              .setHeader("WWW-Authenticate", wwwAuthenticate)
              .status(401)
              .json(body)
              .send();
            return;
          }
          res.locals.email = email;
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
        next: express.NextFunction,
      ): void {
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

      async function testHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): Promise<void> {
        Common.Debug.debug("Test:");

        res.status(200).json({});
      }

      async function shsHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): Promise<void> {
        const shsRequest = req.body;
        Common.Debug.debug("Smart Home Skill Request:");
        Common.Debug.debugJSON(shsRequest);

        const shsResponseWrapper = await frontend._middle.handler(
          res.locals.email,
          shsRequest,
        );
        const shsResponse = shsResponseWrapper.response;
        const statusCode = shsResponseWrapper.statusCode;
        Common.Debug.debug("Smart Home Skill Response:");
        Common.Debug.debug(`statusCode: ${statusCode}`);
        Common.Debug.debugJSON(shsResponse);
        if (typeof shsResponseWrapper.error !== "undefined") {
          Common.Debug.debug("smart home skill error response");
          Common.Debug.debugErrorWithStack(shsResponseWrapper.error);
        }

        // Check SHS Response against the SHS schema.
        try {
          const valid = await frontend._schemaValidator(shsResponse);
          if (!valid) {
            Common.Debug.debug(
              "Smart Home Skill Response schema validation validation",
            );
            Common.Debug.debugJSON(frontend._schemaValidator.errors);
          } else {
            Common.Debug.debug(
              "Smart Home Skill Response schema validation passed",
            );
          }
        } catch (error) {
          Common.Debug.debug(
            "Smart Home Skill Response schema validation error:",
          );
          Common.Debug.debugError(error);
        }

        res.status(statusCode).json(shsResponse);
      }

      // Log request message
      frontend._server.use(requestHeaderLoggingHandler);
      // Check the IP address blacklist.
      frontend._server.use(ipBlacklistHandler);
      // Handle exchange of JWT for bridgeToken.
      frontend._server.get(
        Common.constants.bridge.path.login,
        expressjwt({
          secret: frontend._authorization.x509PublicCert(),
          algorithms: ["RS256"],
        }),
        jwtErrorHandler,
        jwtPayloadHandler,
      );
      // Handle Smart Home Skill directives.
      frontend._server.post(
        Common.constants.bridge.path.skill,
        bridgeTokenAuthorizationHandler,
        requestTypeHandler,
        express.json(),
        shsHandler,
      );
      // Handle test
      frontend._server.get(
        Common.constants.bridge.path.test,
        bridgeTokenAuthorizationHandler,
        testHandler,
      );
      frontend._server.use(
        (req: express.Request, res: express.Response): void => {
          res.status(404).json({});
        },
      );
    }

    buildServer();

    return frontend;
  }

  public start(): void {
    this._server.listen(
      Common.constants.bridge.port.http,
      Common.constants.bridge.host,
    );
  }
}
