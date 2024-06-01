//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import express from "express";
import * as Common from "../../../common";
import type { Credentials } from "./credentials";
import { Application } from "./application";
import { UserAuth } from "./user-auth";
import { LoginTokenAuth } from "./login-token-auth";
import { BridgeTokenAuth } from "./bridge-token-auth";

export type { Credentials } from "./credentials";
export { Application } from "./application";

type FrontendCommonErrorCode =
  | "bodyFormatInvalid"
  | "contentTypeValueInvalid"
  | "contentTypeNotFound"
  | "internalServerError"
  | "methodNotAllowed"
  | "notFound"
  | "unauthorized";

const errorCodeToStatusCode: Record<string, number> = {
  bodyFormatInvalid: 422,
  contentTypeValueInvalid: 415,
  contentTypeNotFound: 400,
  internalServerError: 500,
  methodNotAllowed: 405,
  notFound: 404,
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

class LoginApplication extends Application {
  private readonly _bridgeTokenAuth: BridgeTokenAuth;

  public constructor(_bridgeTokenAuth: BridgeTokenAuth) {
    super();
    this._bridgeTokenAuth = _bridgeTokenAuth;
  }

  public async start(): Promise<void> {
    await new Promise<void>((resolve) => {
      resolve();
    });
  }

  public getRequestSkillToken(request: object): string {
    const testRequest = request as {
      skillToken?: string;
    };
    if (typeof testRequest.skillToken !== "string") {
      throw createError("bodyFormatInvalid");
    }
    return testRequest.skillToken;
  }

  public async handleRequest(
    request: object,
    credentials: Credentials,
  ): Promise<object> {
    const bridgeToken = this._bridgeTokenAuth.generateBridgeToken();
    try {
      await this._bridgeTokenAuth.setCredentials(bridgeToken, credentials);
    } catch (error) {
      throw createError("internalServerError", error);
    }
    return { token: bridgeToken };
  }
}

class TestApplication extends Application {
  public async start(): Promise<void> {
    await new Promise<void>((resolve) => {
      resolve();
    });
  }

  public getRequestSkillToken(request: object): string {
    const testRequest = request as {
      skillToken?: string;
    };
    if (typeof testRequest.skillToken !== "string") {
      throw createError("bodyFormatInvalid");
    }
    return testRequest.skillToken;
  }

  public async handleRequest(
    request: object,
    credentials: Credentials,
  ): Promise<object> {
    return {};
  }
}

export interface LinkDescription {
  path: string;
  bearerTokenType: "loginToken" | "bridgeToken";
  linkType: "login" | "test" | "service";
  application: Application;
}

export class Frontend {
  private readonly _loginTokenAuth: LoginTokenAuth;
  private readonly _bridgeTokenAuth: BridgeTokenAuth;
  private readonly _links: Record<string, LinkDescription>;
  private readonly _server: express.Express;
  /**
   * The constructor is private. To instantiate a Frontend, use {@link Frontend.build}().
   */
  private constructor(
    _loginTokenAuth: LoginTokenAuth,
    _bridgeTokenAuth: BridgeTokenAuth,
    _links: Record<string, LinkDescription>,
    _server: express.Express,
  ) {
    this._loginTokenAuth = _loginTokenAuth;
    this._bridgeTokenAuth = _bridgeTokenAuth;
    this._links = _links;
    this._server = _server;
  }

  public static async build(
    configurationDirectory: string,
    serviceApplications: Record<string, Application>,
  ): Promise<Frontend> {
    const _userAuth = await UserAuth.build(configurationDirectory);
    const _loginTokenAuth = LoginTokenAuth.build(_userAuth);
    const _bridgeTokenAuth = await BridgeTokenAuth.build(
      _userAuth,
      configurationDirectory,
    );

    const _links: Record<string, LinkDescription> = {};
    _links[Common.constants.bridge.path.login] = {
      path: Common.constants.bridge.path.login,
      bearerTokenType: "loginToken",
      linkType: "login",
      application: new LoginApplication(_bridgeTokenAuth),
    };
    _links[Common.constants.bridge.path.test] = {
      path: Common.constants.bridge.path.test,
      bearerTokenType: "bridgeToken",
      linkType: "test",
      application: new TestApplication(),
    };
    for (const [path, application] of Object.entries(serviceApplications)) {
      _links[path] = {
        path,
        bearerTokenType: "bridgeToken",
        linkType: "service",
        application,
      };
    }

    const _server = express();

    const frontend = new Frontend(
      _loginTokenAuth,
      _bridgeTokenAuth,
      _links,
      _server,
    );

    /*
     * Function to handle the links.
     */
    function linkHandler(
      request: express.Request,
      response: express.Response,
    ): void {
      const linkHandlerAsync = async (): Promise<void> => {
        try {
          Common.Debug.debug("HTTP request headers:");
          Common.Debug.debug(`hostname: ${request.hostname}`);
          Common.Debug.debug(`path: ${request.path}`);
          Common.Debug.debug(`method: ${request.method}`);
          Common.Debug.debugJSON(request.headers);

          const link = frontend._links[request.path];
          if (link === undefined) {
            throw createError("notFound");
          }

          if (request.method !== "POST") {
            throw createError("methodNotAllowed");
          }

          /*
           * Get the bearerToken from the 'authorization' header.
           */
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
          const bearerToken: string = authorization[1];

          /*
           * Use bearerToken to authorize and return the credentials.
           */
          let credentials: Credentials | null = null;
          try {
            credentials = await (link.bearerTokenType === "loginToken"
              ? frontend._loginTokenAuth.authorizeLoginToken(bearerToken)
              : frontend._bridgeTokenAuth.authorizeBridgeToken(bearerToken));
          } catch (error) {
            throw createError("internalServerError", error);
          }
          if (credentials === null) {
            throw createError("unauthorized");
          }

          /*
           * Verify that 'content-type' is 'application/json'.
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
           * Parse the raw request body to a JSON request body.
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
          if (
            link.application.getRequestSkillToken(requestBody) !==
            credentials.skillToken
          ) {
            throw createError("unauthorized");
          }

          /*
           * Do application level processing.
           */
          const responseBody: object = await link.application.handleRequest(
            requestBody,
            credentials,
          );
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

    frontend._server.use(linkHandler);

    return frontend;
  }

  public start(): void {
    this._server.listen(
      Common.constants.bridge.port.http,
      Common.constants.bridge.host,
    );
  }
}
