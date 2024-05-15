//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { URL } from "node:url";
import express from "express";
import { expressjwt, ExpressJwtRequest } from "express-jwt";
import IPBlacklist from "@outofsync/express-ip-blacklist";
import * as Common from "../../../common";
import { Configuration } from "../configuration";
import { Middle } from "../middle";
import { LoginTokenAuth } from "./login-token-auth";
import { BridgeTokenAuth } from "./bridge-token-auth";

export class Frontend {
  private readonly _loginTokenAuth: LoginTokenAuth;
  private readonly _bridgeTokenAuth: BridgeTokenAuth;
  private readonly _middle: Middle;
  private readonly _ipBlacklist: IPBlacklist;
  private readonly _server: express.Express;
  /**
   * The constructor is private. To instantiate a Frontend, use {@link Frontend.build}().
   */
  private constructor(
    _loginTokenAuth: LoginTokenAuth,
    _bridgeTokenAuth: BridgeTokenAuth,
    _middle: Middle,
    _ipBlacklist: IPBlacklist,
    _server: express.Express,
  ) {
    this._loginTokenAuth = _loginTokenAuth;
    this._bridgeTokenAuth = _bridgeTokenAuth;
    this._middle = _middle;
    this._ipBlacklist = _ipBlacklist;
    this._server = _server;
  }

  public static async build(configuration: Configuration, middle: Middle) {
    const _loginToken = LoginTokenAuth.build(configuration);
    const _bridgeToken = await BridgeTokenAuth.build(configuration);

    // The blacklist is due to auth failures so blacklist quickly.
    // There should be no auth failures and each auth failure results
    // in sending a profile request to Amazon.
    const _ipBlacklist = new IPBlacklist("blacklist", { count: 5 });

    const _server = express();

    const frontend = new Frontend(
      _loginToken,
      _bridgeToken,
      middle,
      _ipBlacklist,
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

      function loginTokenAuthorizationHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        const asyncLoginTokenAuthorizationHandler = expressjwt({
          secret: frontend._loginTokenAuth.x509PublicCert(),
          algorithms: ["RS256"],
        });

        void asyncLoginTokenAuthorizationHandler(req, res, next).catch(
          (error: unknown) => {
            next(error);
          },
        );
      }

      function jwtErrorHandler(
        err: unknown,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        Common.Debug.debug("jwtErrorHandler: start");
        if (res.headersSent) {
          next(err);
          return;
        }

        if (err) {
          ipBlacklistIncrement(req, res);
          Common.Debug.debug("jwtErrorHandler: Failed Validation:");
          Common.Debug.debugError(err);
          const wwwAuthenticate = "Bearer";
          res
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json({});
          return;
        }

        next(err);
        return;
      }

      function jwtPayloadHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        async function asyncJwtPayloadHandler(
          req: express.Request,
          res: express.Response,
          next: express.NextFunction,
        ): Promise<void> {
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
              await frontend._loginTokenAuth.authorizeJwTPayload(jwtPayload);
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
          const skillToken = jwtPayload.sub;

          if (typeof jwtPayload.aud !== "string") {
            res.status(500).json({});
            return;
          }
          const url = new URL(jwtPayload.aud);
          const bridgeHostname = url.hostname;

          let userId: string;
          let email: string;
          try {
            const userProfile: Common.Profile.UserProfile =
              await Common.Profile.getUserProfile(skillToken);
            userId = userProfile.userId;
            email = userProfile.email;
          } catch (e) {
            const error: Common.Error.CommonError =
              e as Common.Error.CommonError;
            if (
              typeof error.general === "string" &&
              error.general === "authorization"
            ) {
              const wwwAuthenticate = "Bearer";
              res
                .setHeader("WWW-Authenticate", wwwAuthenticate)
                .status(401)
                .json({})
                .send();
              return;
            }
            res.status(500).json({}).send();
            return;
          }

          res.locals.bridgeHostname = bridgeHostname;
          res.locals.userId = userId;
          res.locals.email = email;
          res.locals.skillToken = skillToken;

          next();
        }

        void asyncJwtPayloadHandler(req, res, next).catch((error: unknown) => {
          next(error);
        });
      }

      function bridgeTokenAuthorizationHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        async function asyncBridgeTokenAuthorizationHandler(
          req: express.Request,
          res: express.Response,
          next: express.NextFunction,
        ): Promise<void> {
          Common.Debug.debug("bridgeTokenAuthorizationHandler: start");
          function invalidAuthorizationCredentialResponse(message: string) {
            return {
              error: "INVALID_AUTHORIZATION_CREDENTIAL",
              error_description: message,
            };
          }

          res.locals.bridgeHostname = null;
          res.locals.userId = null;
          res.locals.email = null;
          res.locals.skillToken = null;

          // Extract bridgeToken from "authorization" header. RFC-6750 allows
          // for the Bearer token to be included in the "authorization" header, as
          // part part of the URL or in the body. Since we put it in the header, we
          // know that is were it will be. Per RFC-6750, failure to find the Bearer
          // token results 401 response that includes a "WWW-Authenticate" header.
          const wwwAuthenticate = "Bearer";
          if (req.headers.authorization === "undefined") {
            ipBlacklistIncrement(req, res);
            const body = invalidAuthorizationCredentialResponse(
              'Bridge connection failed due to missing "authorization" header.',
            );
            Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
            Common.Debug.debugJSON(body);
            res
              .setHeader("WWW-Authenticate", wwwAuthenticate)
              .status(401)
              .json({});
            return;
          }
          const authorization =
            req.headers.authorization?.split(/\s+/).map((x) => x.trim()) ?? [];
          if (authorization.length !== 2) {
            ipBlacklistIncrement(req, res);
            const body = invalidAuthorizationCredentialResponse(
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
            const body = invalidAuthorizationCredentialResponse(
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
            const record =
              await frontend._bridgeTokenAuth.authorizeBridgeToken(bridgeToken);
            if (record === null) {
              ipBlacklistIncrement(req, res);
              const body = invalidAuthorizationCredentialResponse(
                "Bridge connection failed due to invalid bearer token.",
              );
              res
                .setHeader("WWW-Authenticate", wwwAuthenticate)
                .status(401)
                .json(body)
                .send();
              return;
            }
            res.locals.bridgeHostname = record.bridgeHostname;
            res.locals.email = record.email;
            res.locals.userId = record.userId;
            res.locals.skillToken = record.skillToken;
          } catch (error) {
            Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
            Common.Debug.debugError(error);
            res.status(500).json({});
            return;
          }
          Common.Debug.debug("bridgeTokenAuthorizationHandler: success");
          next();
        }

        void asyncBridgeTokenAuthorizationHandler(req, res, next).catch(
          (error: unknown) => {
            next(error);
          },
        );
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
        if (
          contentType
            .split(/\s*;\s*/)[0]
            .trim()
            .toLowerCase() !== "application/json"
        ) {
          ipBlacklistIncrement(req, res);
          res.status(415).json({});
          return;
        }
        next();
      }

      function testAuthorizationHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        const testRequest: { skillToken?: string } = req.body as {
          skillToken?: string;
        };

        if (typeof testRequest.skillToken !== "string") {
          ipBlacklistIncrement(req, res);
          res.status(422).json({}).send();
          return;
        }

        const authorizedSkillToken: string = res.locals.skillToken as string;
        const skillToken: string = testRequest.skillToken;

        if (authorizedSkillToken !== skillToken) {
          ipBlacklistIncrement(req, res);
          const wwwAuthenticate = "Bearer";
          res
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json({})
            .send();
          return;
        }

        next();
      }

      function serviceAuthorizationHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        function invalidAuthorizationCredentialResponse(message: string) {
          return {
            error: "INVALID_AUTHORIZATION_CREDENTIAL",
            error_description: message,
          };
        }

        const authorizedSkillToken: string = res.locals.skillToken as string;
        const skillToken: string = frontend._middle.getSkillToken(
          req.body as object,
        );

        if (authorizedSkillToken !== skillToken) {
          ipBlacklistIncrement(req, res);
          const wwwAuthenticate = "Bearer";
          const body = invalidAuthorizationCredentialResponse(
            "Bridge connection failed due to invalid bearer token.",
          );
          res
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json(body)
            .send();
          return;
        }

        next();
      }

      function loginHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        async function asyncLoginHandler(
          req: express.Request,
          res: express.Response,
        ): Promise<void> {
          Common.Debug.debug("Login:");

          const bridgeHostname: string = res.locals.bridgeHostname as string;
          const email: string = res.locals.email as string;
          const userId: string = res.locals.userId as string;
          const skillToken: string = res.locals.skillToken as string;

          const bridgeToken = frontend._bridgeTokenAuth.generateBridgeToken();
          try {
            await frontend._bridgeTokenAuth.setBridgeToken(
              bridgeToken,
              bridgeHostname,
              email,
              userId,
              skillToken,
            );
          } catch (error) {
            res.status(500).json({});
            return;
          }

          res.status(200).json({
            token: bridgeToken,
          });
        }

        void asyncLoginHandler(req, res).catch((error: unknown) => {
          next(error);
        });
      }

      function testHandler(req: express.Request, res: express.Response): void {
        Common.Debug.debug("Test:");

        res.status(200).json({});
      }

      function serviceHandler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void {
        async function asyncServiceHandler(
          req: express.Request,
          res: express.Response,
        ): Promise<void> {
          const serviceRequest = req.body as { [key: string]: unknown };
          Common.Debug.debug("Service Request:");
          Common.Debug.debugJSON(serviceRequest);

          const serviceResponse =
            await frontend._middle.handler(serviceRequest);

          Common.Debug.debug("Service Response:");
          Common.Debug.debugJSON(serviceResponse);

          res.status(200).json(serviceResponse);
        }

        asyncServiceHandler(req, res).catch((error: unknown) => {
          next(error);
        });
      }

      // Log request message
      frontend._server.use(requestHeaderLoggingHandler);
      // Check the IP address blacklist.
      frontend._server.use(ipBlacklistHandler);

      // Handle login
      frontend._server.get(
        Common.constants.bridge.path.login,
        loginTokenAuthorizationHandler,
        jwtErrorHandler,
        jwtPayloadHandler,
        loginHandler,
      );

      // Handle test
      frontend._server.post(
        Common.constants.bridge.path.test,
        bridgeTokenAuthorizationHandler,
        requestTypeHandler,
        express.json(),
        testAuthorizationHandler,
        testHandler,
      );

      // Handle Smart Home Skill directives.
      frontend._server.post(
        Common.constants.bridge.path.service,
        bridgeTokenAuthorizationHandler,
        requestTypeHandler,
        express.json(),
        serviceAuthorizationHandler,
        serviceHandler,
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
