import type LGTV from "lgtv2";
import * as Common from "../../../../common";
import type { Credentials, Application } from "../../link";
import { TvManager } from "./tv-manager";
import { Authorization } from "./authorization";
import * as SHS from "./smart-home-skill";

export { TvManager, type TvRecord } from "./tv-manager";

class ShsToLgWebOsTvService implements Application {
  private readonly _authorization: Authorization;
  private readonly _tvManager: TvManager;
  private constructor(_authorization: Authorization, _tvManager: TvManager) {
    this._authorization = _authorization;
    this._tvManager = _tvManager;
  }

  public static async build(
    configurationDirectory: string,
  ): Promise<ShsToLgWebOsTvService> {
    const _authorization = await Authorization.build(configurationDirectory);

    const _tvManager = await TvManager.build(configurationDirectory);
    _tvManager.on("error", (error: Error, id: string): void => {
      Common.Debug.debug(id);
      Common.Debug.debugError(error);
    });

    const service = new ShsToLgWebOsTvService(_authorization, _tvManager);

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
      service._tvManager.on(
        uri,
        (error: Common.CommonError, response: LGTV.Response, udn: string) => {
          SHS.callback(
            uri,
            error,
            response,
            udn,
            service._authorization,
            service._tvManager,
          );
        },
      );
    }

    return service;
  }

  public async start(): Promise<void> {
    await this._tvManager.start();
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

    let shsResponse: Common.SHS.Response | undefined = undefined;

    try {
      shsResponse = await SHS.handler(
        shsRequest,
        this._authorization,
        this._tvManager,
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
  return await ShsToLgWebOsTvService.build(configurationDirectory);
}
