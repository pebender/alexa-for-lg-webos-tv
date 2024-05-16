//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { URL } from "node:url";
import express from "express";
import { expressjwt } from "express-jwt";
import type { ExpressJwtRequest } from "express-jwt";
import IPBlacklist from "@outofsync/express-ip-blacklist";
import * as Common from "../../../common";
import type { Configuration } from "../configuration";
import type { Middle } from "../middle";
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

  public static async build(
    configuration: Configuration,
    middle: Middle,
  ): Promise<Frontend> {
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
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        Common.Debug.debug("HTTP request headers:");
        Common.Debug.debug(`hostname: ${request.hostname}`);
        Common.Debug.debug(`path: ${request.path}`);
        Common.Debug.debug(`method: ${request.method}`);
        Common.Debug.debugJSON(request.headers);
        next();
      }

      function ipBlacklistHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        Common.Debug.debug("ipBlacklistHandler: start");
        frontend._ipBlacklist.checkBlacklist(request, response, next);
        Common.Debug.debug("ipBlacklistHandler: end");
      }

      function ipBlacklistIncrement(
        request: express.Request,
        response: express.Response,
      ): void {
        Common.Debug.debug("ipBlacklistIncrement: start");
        frontend._ipBlacklist.increment(request, response);
      }

      function loginTokenAuthorizationHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        const asyncLoginTokenAuthorizationHandler = expressjwt({
          secret: frontend._loginTokenAuth.x509PublicCert(),
          algorithms: ["RS256"],
        });

        void asyncLoginTokenAuthorizationHandler(request, response, next).catch(
          (error: unknown) => {
            next(error);
          },
        );
      }

      function jwtErrorHandler(
        error: unknown,
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        Common.Debug.debug("jwtErrorHandler: start");
        if (response.headersSent) {
          next(error);
          return;
        }

        if (error !== null) {
          ipBlacklistIncrement(request, response);
          Common.Debug.debug("jwtErrorHandler: Failed Validation:");
          Common.Debug.debugError(error);
          const wwwAuthenticate = "Bearer";
          response
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json({});
          return;
        }

        next(error);
      }

      function jwtPayloadHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        async function asyncJwtPayloadHandler(
          request: express.Request,
          response: express.Response,
          next: express.NextFunction,
        ): Promise<void> {
          Common.Debug.debug("jwtPayloadHandler: start");
          const jwtPayload = (request as unknown as ExpressJwtRequest).auth;

          if (jwtPayload === undefined) {
            ipBlacklistIncrement(request, response);
            Common.Debug.debug("jwtPayloadHandler: error: no 'request.auth'.");
            response.status(401).json({}).end();
            return;
          }

          Common.Debug.debugJSON(jwtPayload);

          try {
            const authorized =
              await frontend._loginTokenAuth.authorizeJwTPayload(jwtPayload);
            if (!authorized) {
              ipBlacklistIncrement(request, response);
              Common.Debug.debug("jwtPayloadHandler: failed authorization");
              response.status(401).json({});
              return;
            }
          } catch (error) {
            Common.Debug.debugError(error);
            response.status(500).json({});
          }

          if (typeof jwtPayload.sub !== "string") {
            response.status(500).json({});
            return;
          }
          const skillToken = jwtPayload.sub;

          if (typeof jwtPayload.aud !== "string") {
            response.status(500).json({});
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
          } catch (error) {
            if (
              error instanceof Common.Error.CommonError &&
              error.general === "authorization"
            ) {
              const wwwAuthenticate = "Bearer";
              response
                .setHeader("WWW-Authenticate", wwwAuthenticate)
                .status(401)
                .json({})
                .send();
              return;
            }
            response.status(500).json({}).send();
            return;
          }

          response.locals.bridgeHostname = bridgeHostname;
          response.locals.userId = userId;
          response.locals.email = email;
          response.locals.skillToken = skillToken;

          next();
        }

        void asyncJwtPayloadHandler(request, response, next).catch(
          (error: unknown) => {
            next(error);
          },
        );
      }

      function bridgeTokenAuthorizationHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        async function asyncBridgeTokenAuthorizationHandler(
          request: express.Request,
          response: express.Response,
          next: express.NextFunction,
        ): Promise<void> {
          Common.Debug.debug("bridgeTokenAuthorizationHandler: start");
          function invalidAuthorizationCredentialResponse(
            message: string,
          ): object {
            return {
              error: "INVALID_AUTHORIZATION_CREDENTIAL",
              error_description: message,
            };
          }

          response.locals.bridgeHostname = null;
          response.locals.userId = null;
          response.locals.email = null;
          response.locals.skillToken = null;

          // Extract bridgeToken from "authorization" header. RFC-6750 allows
          // for the Bearer token to be included in the "authorization" header, as
          // part part of the URL or in the body. Since we put it in the header, we
          // know that is were it will be. Per RFC-6750, failure to find the Bearer
          // token results 401 response that includes a "WWW-Authenticate" header.
          const wwwAuthenticate = "Bearer";
          if (request.headers.authorization === "undefined") {
            ipBlacklistIncrement(request, response);
            const body = invalidAuthorizationCredentialResponse(
              'Bridge connection failed due to missing "authorization" header.',
            );
            Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
            Common.Debug.debugJSON(body);
            response
              .setHeader("WWW-Authenticate", wwwAuthenticate)
              .status(401)
              .json({});
            return;
          }
          const authorization =
            request.headers.authorization?.split(/\s+/).map((x) => x.trim()) ??
            [];
          if (authorization.length !== 2) {
            ipBlacklistIncrement(request, response);
            const body = invalidAuthorizationCredentialResponse(
              'Bridge connection failed due to malformed "authorization" header.',
            );
            Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
            Common.Debug.debugJSON(body);
            response
              .setHeader("WWW-Authenticate", wwwAuthenticate)
              .status(401)
              .json(body);
            return;
          }
          if (authorization[0].toLowerCase() !== "bearer") {
            ipBlacklistIncrement(request, response);
            const body = invalidAuthorizationCredentialResponse(
              "Bridge connection failed due to incorrect authorization method.",
            );
            Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
            Common.Debug.debugJSON(body);
            response
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
              ipBlacklistIncrement(request, response);
              const body = invalidAuthorizationCredentialResponse(
                "Bridge connection failed due to invalid bearer token.",
              );
              response
                .setHeader("WWW-Authenticate", wwwAuthenticate)
                .status(401)
                .json(body)
                .send();
              return;
            }
            response.locals.bridgeHostname = record.bridgeHostname;
            response.locals.email = record.email;
            response.locals.userId = record.userId;
            response.locals.skillToken = record.skillToken;
          } catch (error) {
            Common.Debug.debug("bridgeTokenAuthorizationHandler: failure:");
            Common.Debug.debugError(error);
            response.status(500).json({});
            return;
          }
          Common.Debug.debug("bridgeTokenAuthorizationHandler: success");
          next();
        }

        void asyncBridgeTokenAuthorizationHandler(
          request,
          response,
          next,
        ).catch((error: unknown) => {
          next(error);
        });
      }

      function requestTypeHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        const contentType = request.headers["content-type"];
        if (contentType === undefined) {
          ipBlacklistIncrement(request, response);
          response.status(400).json({});
          return;
        }
        if (
          contentType
            .split(/\s*;\s*/)[0]
            .trim()
            .toLowerCase() !== "application/json"
        ) {
          ipBlacklistIncrement(request, response);
          response.status(415).json({});
          return;
        }
        next();
      }

      function testAuthorizationHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        const testRequest: { skillToken?: string } = request.body as {
          skillToken?: string;
        };

        if (typeof testRequest.skillToken !== "string") {
          ipBlacklistIncrement(request, response);
          response.status(422).json({}).send();
          return;
        }

        const authorizedSkillToken: string = response.locals
          .skillToken as string;
        const skillToken: string = testRequest.skillToken;

        if (authorizedSkillToken !== skillToken) {
          ipBlacklistIncrement(request, response);
          const wwwAuthenticate = "Bearer";
          response
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json({})
            .send();
          return;
        }

        next();
      }

      function serviceAuthorizationHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        function invalidAuthorizationCredentialResponse(
          message: string,
        ): object {
          return {
            error: "INVALID_AUTHORIZATION_CREDENTIAL",
            error_description: message,
          };
        }

        const authorizedSkillToken: string = response.locals
          .skillToken as string;
        const skillToken: string = frontend._middle.getSkillToken(
          request.body as object,
        );

        if (authorizedSkillToken !== skillToken) {
          ipBlacklistIncrement(request, response);
          const wwwAuthenticate = "Bearer";
          const body = invalidAuthorizationCredentialResponse(
            "Bridge connection failed due to invalid bearer token.",
          );
          response
            .setHeader("WWW-Authenticate", wwwAuthenticate)
            .status(401)
            .json(body)
            .send();
          return;
        }

        next();
      }

      function loginHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        async function asyncLoginHandler(
          request: express.Request,
          response: express.Response,
        ): Promise<void> {
          Common.Debug.debug("Login:");

          const bridgeHostname: string = response.locals
            .bridgeHostname as string;
          const email: string = response.locals.email as string;
          const userId: string = response.locals.userId as string;
          const skillToken: string = response.locals.skillToken as string;

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
            Common.Debug.debugError(error);
            response.status(500).json({});
            return;
          }

          response.status(200).json({
            token: bridgeToken,
          });
        }

        void asyncLoginHandler(request, response).catch((error: unknown) => {
          next(error);
        });
      }

      function testHandler(
        request: express.Request,
        response: express.Response,
      ): void {
        Common.Debug.debug("Test:");

        response.status(200).json({});
      }

      function serviceHandler(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        async function asyncServiceHandler(
          request: express.Request,
          response: express.Response,
        ): Promise<void> {
          const serviceRequest = request.body as Record<string, unknown>;
          Common.Debug.debug("Service Request:");
          Common.Debug.debugJSON(serviceRequest);

          const serviceResponse =
            await frontend._middle.handler(serviceRequest);

          Common.Debug.debug("Service Response:");
          Common.Debug.debugJSON(serviceResponse);

          response.status(200).json(serviceResponse);
        }

        asyncServiceHandler(request, response).catch((error: unknown) => {
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
        (request: express.Request, response: express.Response): void => {
          response.status(404).json({});
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
