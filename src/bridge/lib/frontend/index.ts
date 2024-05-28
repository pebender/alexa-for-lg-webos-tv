//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import express from "express";
import * as Common from "../../../common";
import type { Configuration } from "../configuration";
import type { Middle } from "../middle";
import { LoginTokenAuth } from "./login-token-auth";
import {
  BridgeTokenAuth,
  type BridgeTokenAuthRecord,
} from "./bridge-token-auth";

interface Credentials {
  bridgeHostname: string;
  email: string;
  userId: string;
  skillToken: string;
}

type FrontendCommonErrorCode =
  | "bodyFormatInvalid"
  | "contentTypeValueInvalid"
  | "contentTypeNotFound"
  | "internalServerError"
  | "unauthorized";

class FrontendCommonError extends Common.CommonError {
  public readonly code: FrontendCommonErrorCode;

  constructor(options: {
    code: FrontendCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "FrontendCommonError";
    this.code = options.code;
  }
}

function errorUnauthorized(options?: {
  message?: string;
  cause?: unknown;
}): FrontendCommonError {
  return new FrontendCommonError({
    code: "unauthorized",
    message: options?.message,
    cause: options?.cause,
  });
}

function errorInternalServerError(options?: {
  message?: string;
  cause?: unknown;
}): Common.CommonError {
  return new FrontendCommonError({
    code: "internalServerError",
    message: options?.message,
    cause: options?.cause,
  });
}

function errorContentTypeMissing(options?: {
  message?: string;
  cause?: unknown;
}): Common.CommonError {
  return new FrontendCommonError({
    code: "contentTypeNotFound",
    message: options?.message,
    cause: options?.cause,
  });
}

function errorContentTypeIncorrect(options?: {
  message?: string;
  cause?: unknown;
}): Common.CommonError {
  return new FrontendCommonError({
    code: "contentTypeValueInvalid",
    message: options?.message,
    cause: options?.cause,
  });
}

function errorBodyInvalidFormat(options?: {
  message?: string;
  cause?: unknown;
}): Common.CommonError {
  return new FrontendCommonError({
    code: "bodyFormatInvalid",
    message: options?.message,
    cause: options?.cause,
  });
}

export class Frontend {
  private readonly _loginTokenAuth: LoginTokenAuth;
  private readonly _bridgeTokenAuth: BridgeTokenAuth;
  private readonly _middle: Middle;
  private readonly _server: express.Express;
  /**
   * The constructor is private. To instantiate a Frontend, use {@link Frontend.build}().
   */
  private constructor(
    _loginTokenAuth: LoginTokenAuth,
    _bridgeTokenAuth: BridgeTokenAuth,
    _middle: Middle,
    _server: express.Express,
  ) {
    this._loginTokenAuth = _loginTokenAuth;
    this._bridgeTokenAuth = _bridgeTokenAuth;
    this._middle = _middle;
    this._server = _server;
  }

  public static async build(
    configuration: Configuration,
    middle: Middle,
  ): Promise<Frontend> {
    const _loginToken = LoginTokenAuth.build(configuration);
    const _bridgeToken = await BridgeTokenAuth.build(configuration);

    const _server = express();

    const frontend = new Frontend(_loginToken, _bridgeToken, middle, _server);

    function buildServer(): void {
      /**
       * This wrapper function takes and handlerCore and returns and express
       * middleware handler. Many of the handlers call functions that rely on
       * promises with try/catch/throw rather than callbacks for asynchronous
       * operation and error handling. However, express relies on callbacks
       * (specifically, the `next` function). This function wraps a handler
       * written with promises and try/catch/throw, calling next(error) upon
       * error and calling next() or returning upon success.
       *
       * @param handler -
       * @param continueOnSuccess - on success continue by calling next() rather
       * than returning. This is the default.
       * @returns - no return.
       */
      function synchronizer(
        handlerCore: (
          request: express.Request,
          response: express.Response,
        ) => void | Promise<void>,
        continueOnSuccess: boolean = true,
      ): (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ) => void {
        return (
          request: express.Request,
          response: express.Response,
          next: express.NextFunction,
        ): void => {
          if (continueOnSuccess) {
            Promise.resolve(handlerCore(request, response))
              .then(() =>
                setImmediate((): void => {
                  // eslint-disable-next-line promise/no-callback-in-promise
                  next();
                }),
              )
              .catch((error: unknown) =>
                setImmediate((): void => {
                  // eslint-disable-next-line promise/no-callback-in-promise
                  next(error);
                }),
              );
          } else {
            Promise.resolve(handlerCore(request, response)).catch(
              (error: unknown) =>
                setImmediate((): void => {
                  // eslint-disable-next-line promise/no-callback-in-promise
                  next(error);
                }),
            );
          }
        };
      }

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

      async function linkTokenAuthorizationHandlerCore(
        request: express.Request,
        response: express.Response,
        tokenType: "loginToken" | "bridgeToken",
      ): Promise<void> {
        Common.Debug.debug("linkTokenAuthorizationHandlerCore: start");

        delete response.locals.credentials;

        // Extract bridgeToken from "authorization" header. RFC-6750 allows
        // for the Bearer token to be included in the "authorization" header, as
        // part part of the URL or in the body. Since we put it in the header, we
        // know that is were it will be. Per RFC-6750, failure to find the Bearer
        // token results 401 response that includes a "WWW-Authenticate" header.
        if (request.headers.authorization === "undefined") {
          throw errorUnauthorized({
            message:
              'Bridge connection failed due to missing "authorization" header.',
          });
        }
        const authorization =
          request.headers.authorization?.split(/\s+/).map((x) => x.trim()) ??
          [];
        if (authorization.length !== 2) {
          throw errorUnauthorized({
            message:
              'Bridge connection failed due to malformed "authorization" header.',
          });
        }
        if (authorization[0].toLowerCase() !== "bearer") {
          throw errorUnauthorized({
            message:
              "Bridge connection failed due to incorrect authorization method.",
          });
        }
        const token: string = authorization[1];

        let record: Credentials | null = null;
        try {
          if (tokenType === "loginToken") {
            record = await frontend._loginTokenAuth.authorizeLoginToken(token);
          } else if (tokenType === "bridgeToken") {
            record =
              await frontend._bridgeTokenAuth.authorizeBridgeToken(token);
          }
        } catch (error) {
          throw errorInternalServerError({ cause: error });
        }
        if (record === null) {
          throw errorUnauthorized({
            message: "Bridge connection failed due to invalid login token.",
          });
        }
        response.locals.credentials = record;
        Common.Debug.debug("linkTokenAuthorizationHandlerCore: success");
      }

      async function loginTokenAuthorizationHandlerCore(
        request: express.Request,
        response: express.Response,
      ): Promise<void> {
        Common.Debug.debug("loginTokenAuthorizationHandlerCore: start");
        await linkTokenAuthorizationHandlerCore(
          request,
          response,
          "loginToken",
        );
        Common.Debug.debug("loginTokenAuthorizationHandlerCore: success");
      }

      async function bridgeTokenAuthorizationHandlerCore(
        request: express.Request,
        response: express.Response,
      ): Promise<void> {
        Common.Debug.debug("bridgeTokenAuthorizationHandlerCore: start");
        await linkTokenAuthorizationHandlerCore(
          request,
          response,
          "bridgeToken",
        );
        Common.Debug.debug("bridgeTokenAuthorizationHandlerCore: success");
      }

      function contentTypeHandlerCore(
        request: express.Request,
        response: express.Response,
      ): void {
        const contentType = request.headers["content-type"];
        if (contentType === undefined) {
          throw errorContentTypeMissing();
        }
        if (
          contentType
            .split(/\s*;\s*/)[0]
            .trim()
            .toLowerCase() !== "application/json"
        ) {
          throw errorContentTypeIncorrect();
        }
      }

      function testAuthorizationHandlerCore(
        request: express.Request,
        response: express.Response,
      ): void {
        const testRequest: { skillToken?: string } = request.body as {
          skillToken?: string;
        };

        if (typeof testRequest.skillToken !== "string") {
          throw errorBodyInvalidFormat();
        }

        const authorizedSkillToken: string = response.locals.credentials
          .skillToken as string;
        const skillToken: string = testRequest.skillToken;

        if (authorizedSkillToken !== skillToken) {
          throw errorUnauthorized();
        }
      }

      function serviceAuthorizationHandlerCore(
        request: express.Request,
        response: express.Response,
      ): void {
        const authorizedSkillToken: string = response.locals.credentials
          .skillToken as string;
        const skillToken: string = frontend._middle.getSkillToken(
          request.body as object,
        );

        if (authorizedSkillToken !== skillToken) {
          throw errorUnauthorized({
            message: "Bridge connection failed due to invalid bearer token.",
          });
        }
      }

      async function loginHandlerCore(
        request: express.Request,
        response: express.Response,
      ): Promise<void> {
        Common.Debug.debug("Login:");
        const credentials = response.locals.credentials as Credentials;
        const record: BridgeTokenAuthRecord = {
          bridgeToken: frontend._bridgeTokenAuth.generateBridgeToken(),
          bridgeHostname: credentials.bridgeHostname,
          email: credentials.email,
          userId: credentials.userId,
          skillToken: credentials.skillToken,
        };
        try {
          await frontend._bridgeTokenAuth.setBridgeToken(record);
        } catch (error) {
          throw errorInternalServerError({ cause: error });
        }

        response.status(200).json({
          token: record.bridgeToken,
        });
      }

      function testHandlerCore(
        request: express.Request,
        response: express.Response,
      ): void {
        Common.Debug.debug("Test:");

        response.status(200).json({});
      }

      async function serviceHandlerCore(
        request: express.Request,
        response: express.Response,
      ): Promise<void> {
        const serviceRequest = request.body as Record<string, unknown>;
        Common.Debug.debug("Service Request:");
        Common.Debug.debugJSON(serviceRequest);

        const serviceResponse = await frontend._middle.handler(serviceRequest);

        Common.Debug.debug("Service Response:");
        Common.Debug.debugJSON(serviceResponse);

        response.status(200).json(serviceResponse);
      }

      function errorHandler(
        error: unknown,
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ): void {
        Common.Debug.debugError(error);
        if (error instanceof FrontendCommonError) {
          switch (error.code) {
            case "unauthorized": {
              const body = {
                error: error.code,
                error_descriptions: error.message,
              };
              response
                .setHeader("WWW-Authenticate", "Bearer")
                .status(401)
                .json(body)
                .send();
              return;
            }
            case "contentTypeNotFound": {
              response.status(400).json({}).send();
              return;
            }
            case "contentTypeValueInvalid": {
              response.status(415).json({}).send();
              return;
            }
            case "bodyFormatInvalid": {
              response.status(422).json({}).send();
              return;
            }
            case "internalServerError": {
              response.status(500).json({}).send();
              return;
            }
          }
        }
        response.status(500).json({}).send();
      }

      // Log request message
      frontend._server.use(requestHeaderLoggingHandler);

      // Handle login
      frontend._server.post(
        Common.constants.bridge.path.login,
        synchronizer(loginTokenAuthorizationHandlerCore),
        synchronizer(contentTypeHandlerCore),
        express.json(),
        synchronizer(loginHandlerCore, false),
        errorHandler,
      );

      // Handle test
      frontend._server.post(
        Common.constants.bridge.path.test,
        synchronizer(bridgeTokenAuthorizationHandlerCore),
        synchronizer(contentTypeHandlerCore),
        express.json(),
        synchronizer(testAuthorizationHandlerCore),
        synchronizer(testHandlerCore, false),
        errorHandler,
      );

      // Handle Smart Home Skill directives.
      frontend._server.post(
        Common.constants.bridge.path.service,
        synchronizer(bridgeTokenAuthorizationHandlerCore),
        synchronizer(contentTypeHandlerCore),
        express.json(),
        synchronizer(serviceAuthorizationHandlerCore),
        synchronizer(serviceHandlerCore, false),
        errorHandler,
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
