import type LGTV from "lgtv2";
import * as Common from "../../../common";
import { type Credentials, Application } from "../frontend";
import { Backend } from "../backend";
import { Authorization } from "./authorization";
import * as SHS from "./smart-home-skill";

class ShsToLgtvService extends Application {
  private readonly _authorization: Authorization;
  private readonly _backend: Backend;
  private constructor(_authorization: Authorization, _backend: Backend) {
    super();
    this._authorization = _authorization;
    this._backend = _backend;
  }

  public static async build(
    configurationDirectory: string,
  ): Promise<ShsToLgtvService> {
    const _authorization = await Authorization.build(configurationDirectory);

    const _backend = await Backend.build(configurationDirectory);
    _backend.on("error", (error: Error, id: string): void => {
      Common.Debug.debug(id);
      Common.Debug.debugError(error);
    });

    const middle = new ShsToLgtvService(_authorization, _backend);

    const uriList: string[] = [
      "ssap://audio/getStatus",
      "ssap://audio/getVolume",
      "ssap://com.webos.applicationManager/getForegroundAppInfo",
      "ssap://com.webos.applicationManager/listApps",
      "ssap://com.webos.applicationManager/listLaunchPoints",
      "ssap://tv/getChannelList",
      "ssap://tv/getCurrentChannel",
      "ssap://tv/getExternalInputList",
    ];
    for (const uri of uriList) {
      middle._backend.on(
        uri,
        (error: Common.CommonError, response: LGTV.Response, udn: string) => {
          SHS.callback(
            uri,
            error,
            response,
            udn,
            middle._authorization,
            middle._backend,
          );
        },
      );
    }

    return middle;
  }

  public async start(): Promise<void> {
    await this._backend.start();
  }

  public getRequestSkillToken(rawRequest: object): string {
    const shsRequest = new Common.SHS.Request(rawRequest as Common.SHS.Request);
    return shsRequest.getAccessToken();
  }

  public async handleRequest(
    rawRequest: object,
    _credentials: Credentials,
  ): Promise<object> {
    const shsRequest = new Common.SHS.Request(rawRequest as Common.SHS.Request);

    let authorized = false;
    try {
      authorized = await this._authorization.authorizeSkillToken(
        shsRequest.getAccessToken(),
      );
    } catch (error) {
      if (
        error instanceof Common.GeneralCommonError &&
        error.code === "unauthorized"
      ) {
        authorized = false;
      } else {
        return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
          shsRequest,
          error,
        );
      }
    }
    if (!authorized) {
      Common.SHS.Response.buildAlexaErrorResponse(
        shsRequest,
        "INVALID_AUTHORIZATION_CREDENTIAL",
        "",
      );
    }

    let shsResponse: Common.SHS.Response;

    try {
      shsResponse = await SHS.handler(
        shsRequest,
        this._authorization,
        this._backend,
      );
    } catch (error) {
      shsResponse = Common.SHS.Response.buildAlexaErrorResponseForInternalError(
        shsRequest,
        error,
      );
    }

    return shsResponse;
  }
}

export async function getApplication(
  configurationDirectory: string,
): Promise<Application> {
  return await ShsToLgtvService.build(configurationDirectory);
}
