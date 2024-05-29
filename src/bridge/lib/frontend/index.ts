//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import type { Server, IncomingMessage, ServerResponse } from "node:http";
import fastify from "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
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

type AllowedStatusCode = 200 | 400 | 401 | 415 | 422 | 500;

function createResponse(
  response: FastifyReply,
  statusCode: AllowedStatusCode,
  body: object = {},
): object {
  if (statusCode === 401) {
    void response.header("WWW-Authenticate", "Bearer");
  }
  void response.status(statusCode);
  return body;
}

export class Frontend {
  private readonly _loginTokenAuth: LoginTokenAuth;
  private readonly _bridgeTokenAuth: BridgeTokenAuth;
  private readonly _middle: Middle;
  private readonly _server: FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
  >;

  /**
   * The constructor is private. To instantiate a Frontend, use {@link Frontend.build}().
   */
  private constructor(
    _loginTokenAuth: LoginTokenAuth,
    _bridgeTokenAuth: BridgeTokenAuth,
    _middle: Middle,
    _server: FastifyInstance<Server, IncomingMessage, ServerResponse>,
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

    const _server = fastify();

    const frontend = new Frontend(_loginToken, _bridgeToken, middle, _server);

    /*
     * Function to handle the links.
     */
    async function linkHandler(
      request: FastifyRequest,
      response: FastifyReply,
      linkType: "login" | "test" | "service",
    ): Promise<object> {
      try {
        Common.Debug.debug("HTTP request headers:");
        Common.Debug.debug(`hostname: ${request.hostname}`);
        Common.Debug.debug(`url: ${request.url}`);
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
        if (request.headers.authorization === undefined) {
          return createResponse(response, 401);
        }
        const authorization =
          request.headers.authorization.split(/\s+/).map((x) => x.trim()) ?? [];
        if (authorization.length !== 2) {
          return createResponse(response, 401);
        }
        if (authorization[0].toLowerCase() !== "bearer") {
          return createResponse(response, 401);
        }
        const token: string = authorization[1];
        const credentials: Credentials | null = await (linkType === "login"
          ? frontend._loginTokenAuth.authorizeLoginToken(token)
          : frontend._bridgeTokenAuth.authorizeBridgeToken(token));
        if (credentials === null) {
          return createResponse(response, 401);
        }

        /*
         * Verify that 'content-type' is 'application/json'
         */
        const contentType = request.headers["content-type"];
        if (contentType === undefined) {
          return createResponse(response, 400);
        }
        if (
          contentType
            .split(/\s*;\s*/)[0]
            .trim()
            .toLowerCase() !== "application/json"
        ) {
          return createResponse(response, 415);
        }

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
              return createResponse(response, 422);
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
          return createResponse(response, 401);
        }

        /*
         * Do application level processing.
         */
        switch (linkType) {
          case "login": {
            const bridgeToken = frontend._bridgeTokenAuth.generateBridgeToken();
            await frontend._bridgeTokenAuth.setBridgeToken({
              bridgeToken,
              ...credentials,
            });
            return createResponse(response, 200, { token: bridgeToken });
          }
          case "test": {
            return createResponse(response, 200, {});
          }
          case "service": {
            const responseBody = await frontend._middle.handler(
              requestBody as Record<string, unknown>,
            );
            return createResponse(response, 200, responseBody);
          }
        }
      } catch (error) {
        Common.Debug.debugError(error);
        return createResponse(response, 500);
      }
    }

    // Handle login
    frontend._server.post(
      Common.constants.bridge.path.login,
      async (request, response) => {
        return await linkHandler(request, response, "login");
      },
    );

    // Handle test
    frontend._server.post(
      Common.constants.bridge.path.test,
      async (request, response) => {
        return await linkHandler(request, response, "test");
      },
    );

    // Handle Smart Home Skill directives.
    frontend._server.post(
      Common.constants.bridge.path.service,
      async (request, response) => {
        return await linkHandler(request, response, "service");
      },
    );

    return frontend;
  }

  public async start(): Promise<void> {
    await this._server.listen({
      port: Common.constants.bridge.port.http,
      host: Common.constants.bridge.host,
    });
  }
}
