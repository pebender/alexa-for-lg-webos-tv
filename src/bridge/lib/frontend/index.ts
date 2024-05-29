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

const errorCodeToStatusCode: Record<string, number> = {
  bodyFormatInvalid: 422,
  contentTypeValueInvalid: 415,
  contentTypeNotFound: 400,
  internalServerError: 500,
  unauthorized: 401,
};

class FrontendCommonError extends Common.CommonError {
  public readonly code: FrontendCommonErrorCode;
  public readonly statusCode: number;

  constructor(options: {
    code: FrontendCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "FrontendCommonError";
    this.code = options.code;
    this.statusCode = errorCodeToStatusCode[options.code];
  }
}

function createError(
  code: FrontendCommonErrorCode,
  cause?: unknown,
): FrontendCommonError {
  return new FrontendCommonError({ code, cause });
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

    /*
     * Function to handle the links.
     */
    function linkHandler(
      request: express.Request,
      response: express.Response,
      linkType: "login" | "test" | "service",
    ): void {
      const linkHandlerAsync = async (): Promise<void> => {
        try {
          Common.Debug.debug("HTTP request headers:");
          Common.Debug.debug(`hostname: ${request.hostname}`);
          Common.Debug.debug(`path: ${request.path}`);
          Common.Debug.debug(`method: ${request.method}`);
          Common.Debug.debugJSON(request.headers);

          /*
           * Authorize the link token and return the link user's credentials.
           *
           * Extract bridgeToken from "authorization" header. RFC-6750 allows
           * for the Bearer token to be included in the "authorization"
           * header, as part part of the URL or in the body. Since we put it
           * in the header, we know that is were it will be. Per RFC-6750,
           * failure to find the Bearer token results 401 response that
           * includes a "WWW-Authenticate" header.
           */
          let credentials: Credentials | null = null;
          if (request.headers.authorization === undefined) {
            throw createError("unauthorized");
          }
          const authorization =
            request.headers.authorization.split(/\s+/).map((x) => x.trim()) ??
            [];
          if (authorization.length !== 2) {
            throw createError("unauthorized");
          }
          if (authorization[0].toLowerCase() !== "bearer") {
            throw createError("unauthorized");
          }
          const token: string = authorization[1];
          try {
            credentials = await (linkType === "login"
              ? frontend._loginTokenAuth.authorizeLoginToken(token)
              : frontend._bridgeTokenAuth.authorizeBridgeToken(token));
          } catch (error) {
            throw createError("internalServerError", error);
          }
          if (credentials === null) {
            throw createError("unauthorized");
          }

          /*
           * Verify that 'content-type' is 'application/json'
           */
          const contentType = request.headers["content-type"];
          if (contentType === undefined) {
            throw createError("contentTypeNotFound");
          }
          if (
            contentType
              .split(/\s*;\s*/)[0]
              .trim()
              .toLowerCase() !== "application/json"
          ) {
            throw createError("contentTypeValueInvalid");
          }

          /*
           * Parse the raw request body to a json request body
           */
          await new Promise<void>((resolve, reject) => {
            express.json()(request, response, (error: unknown): void => {
              if (error !== undefined) {
                reject(createError("bodyFormatInvalid", error));
              }
              resolve();
            });
          });
          const requestBody: object = request.body as object;

          /*
           * Verify the link and the request carried by the link are bound to the
           * same skillToken.
           */
          let authorized: boolean = false;
          switch (linkType) {
            case "login": {
              authorized = true;
              break;
            }
            case "test": {
              const testRequest = requestBody as {
                skillToken?: string;
              };
              if (typeof testRequest.skillToken !== "string") {
                throw createError("bodyFormatInvalid");
              }
              const skillToken: string = testRequest.skillToken;
              authorized = skillToken === credentials.skillToken;
              break;
            }
            case "service": {
              const skillToken: string =
                frontend._middle.getSkillToken(requestBody);
              authorized = skillToken === credentials.skillToken;
              break;
            }
          }
          if (!authorized) {
            throw createError("unauthorized");
          }

          /*
           * Do application level processing.
           */
          let responseBody: object | undefined;
          switch (linkType) {
            case "login": {
              const bridgeToken =
                frontend._bridgeTokenAuth.generateBridgeToken();
              try {
                await frontend._bridgeTokenAuth.setBridgeToken({
                  bridgeToken,
                  ...credentials,
                });
              } catch (error) {
                throw createError("internalServerError", error);
              }
              responseBody = { token: bridgeToken };
              break;
            }
            case "test": {
              responseBody = {};
              break;
            }
            case "service": {
              responseBody = await frontend._middle.handler(
                requestBody as Record<string, unknown>,
              );
              break;
            }
          }
          if (responseBody === undefined) {
            throw createError("internalServerError");
          }
          response.status(200).json(responseBody);
        } catch (error) {
          Common.Debug.debugError(error);
          if (error instanceof FrontendCommonError) {
            switch (error.statusCode) {
              case 401: {
                const body = {
                  error: error.code,
                  error_descriptions: error.message,
                };
                response
                  .setHeader("WWW-Authenticate", "Bearer")
                  .status(error.statusCode)
                  .json(body)
                  .send();
                return;
              }
              default: {
                response.status(error.statusCode).json({}).send();
              }
            }
          }
        }
      };
      linkHandlerAsync().catch((error: unknown) =>
        setImmediate((): void => {
          Common.Debug.debugJSON(error);
          response.status(500).json({}).send();
        }),
      );
    }

    // Handle login
    frontend._server.post(
      Common.constants.bridge.path.login,
      (request: express.Request, response: express.Response): void => {
        linkHandler(request, response, "login");
      },
    );

    // Handle test
    frontend._server.post(
      Common.constants.bridge.path.test,
      (request: express.Request, response: express.Response): void => {
        linkHandler(request, response, "test");
      },
    );

    // Handle Smart Home Skill directives.
    frontend._server.post(
      Common.constants.bridge.path.service,
      (request: express.Request, response: express.Response): void => {
        linkHandler(request, response, "service");
      },
    );

    frontend._server.use(
      (request: express.Request, response: express.Response): void => {
        response.status(404).json({});
      },
    );

    return frontend;
  }

  public start(): void {
    this._server.listen(
      Common.constants.bridge.port.http,
      Common.constants.bridge.host,
    );
  }
}
