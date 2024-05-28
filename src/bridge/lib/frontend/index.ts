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
import { BridgeTokenAuth } from "./bridge-token-auth";

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
          Promise.resolve(handlerCore(request, response)).catch(
            (error: unknown) =>
              setImmediate((): void => {
                // eslint-disable-next-line promise/no-callback-in-promise
                next(error);
              }),
          );
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

      async function getCredentials(
        authorizationHeader: string | undefined,
        tokenType: "loginToken" | "bridgeToken",
      ): Promise<Credentials> {
        Common.Debug.debug("getCredentials: start");

        // Extract bridgeToken from "authorization" header. RFC-6750 allows
        // for the Bearer token to be included in the "authorization" header, as
        // part part of the URL or in the body. Since we put it in the header, we
        // know that is were it will be. Per RFC-6750, failure to find the Bearer
        // token results 401 response that includes a "WWW-Authenticate" header.
        if (authorizationHeader === undefined) {
          throw errorUnauthorized({
            message:
              'Bridge connection failed due to missing "authorization" header.',
          });
        }
        const authorization =
          authorizationHeader.split(/\s+/).map((x) => x.trim()) ?? [];
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
        Common.Debug.debug("getCredentials: success");
        return record;
      }

      function getTestBodySkillToken(requestBody: object): string {
        const testRequest = requestBody as {
          skillToken?: string;
        };
        if (typeof testRequest.skillToken !== "string") {
          throw errorBodyInvalidFormat();
        }
        return testRequest.skillToken;
      }

      function skillTokenAuthorizationHandler(
        requestBody: object,
        credentials: Credentials,
        linkType: "login" | "test" | "service",
      ): void {
        if (linkType === "login") {
          return;
        }
        let skillToken: string | undefined;
        if (linkType === "test") {
          skillToken = getTestBodySkillToken(requestBody);
        }
        if (linkType === "service") {
          skillToken = frontend._middle.getSkillToken(requestBody);
        }
        if (skillToken === undefined || skillToken !== credentials.skillToken) {
          throw errorUnauthorized({
            message: "Bridge connection failed due to invalid bearer token.",
          });
        }
      }

      async function linkCore(
        request: express.Request,
        response: express.Response,
        linkType: "login" | "test" | "service",
      ): Promise<void> {
        const tokenType = linkType === "login" ? "loginToken" : "bridgeToken";
        const credentials: Credentials = await getCredentials(
          request.headers.authorization,
          tokenType,
        );

        /*
         * Verify that 'content-type' is 'application/json'
         */
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

        /*
         * Parse the raw request body to a json request body
         */
        await new Promise<void>((resolve, reject) => {
          express.json()(request, response, (error: unknown): void => {
            if (error !== undefined) {
              reject(errorBodyInvalidFormat({ cause: error }));
            }
            resolve();
          });
        });
        const requestBody: object = request.body as object;

        /*
         * Verify the link and the request carried by the link are bound to the
         * same skillToken
         */
        skillTokenAuthorizationHandler(requestBody, credentials, linkType);

        /*
         * Do application level processing.
         */
        switch (linkType) {
          case "login": {
            const bridgeToken = frontend._bridgeTokenAuth.generateBridgeToken();
            try {
              await frontend._bridgeTokenAuth.setBridgeToken({
                bridgeToken,
                ...credentials,
              });
            } catch (error) {
              throw errorInternalServerError({ cause: error });
            }
            response.status(200).json({ token: bridgeToken });
            break;
          }
          case "test": {
            response.status(200).json({});
            break;
          }
          case "service": {
            const serviceResponse = await frontend._middle.handler(
              requestBody as Record<string, unknown>,
            );
            response.status(200).json(serviceResponse);
            break;
          }
        }
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
        synchronizer(async (request, response) => {
          await linkCore(request, response, "login");
        }),
        errorHandler,
      );

      // Handle test
      frontend._server.post(
        Common.constants.bridge.path.test,
        synchronizer(async (request, response) => {
          await linkCore(request, response, "test");
        }),
        errorHandler,
      );

      // Handle Smart Home Skill directives.
      frontend._server.post(
        Common.constants.bridge.path.service,
        synchronizer(async (request, response) => {
          await linkCore(request, response, "service");
        }),
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
