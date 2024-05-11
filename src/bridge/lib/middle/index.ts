import * as Common from "../../../common";
import { Authorization } from "./authorization";
import { Backend } from "../backend";
import * as SHS from "./smart-home-skill";
import { Configuration } from "../configuration";

export class Middle {
  private readonly _authorization: Authorization;
  private readonly _backend: Backend;
  private constructor(_authorization: Authorization, _backend: Backend) {
    this._authorization = _authorization;
    this._backend = _backend;
  }

  public static async build(configuration: Configuration, backend: Backend) {
    const _authorization = await Authorization.build(configuration);

    const middle = new Middle(_authorization, backend);

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
    uriList.forEach((uri) => {
      middle._backend.on(uri, (error, response, udn) => {
        SHS.callback(
          uri,
          error,
          response,
          udn,
          middle._authorization,
          middle._backend,
        );
      });
    });

    return middle;
  }

  public getSkillToken(rawRequest: Common.SHS.Request): string {
    const shsRequest = new Common.SHS.Request(rawRequest);
    return shsRequest.getAccessToken();
  }

  public async handler(
    rawRequest: Common.SHS.Request,
  ): Promise<Common.SHS.ResponseWrapper> {
    const shsRequest = new Common.SHS.Request(rawRequest);

    let authorized: boolean = false;
    try {
      authorized = await this._authorization.authorizeSkillToken(
        shsRequest.getAccessToken(),
      );
    } catch (c) {
      const cause: Common.Error.AlexaForLGwebOSTVError =
        c as Common.Error.AlexaForLGwebOSTVError;
      if (
        typeof cause.general === "string" &&
        cause.general === "authorization"
      ) {
        authorized = false;
      } else {
        throw cause;
      }
    }
    if (!authorized) {
      Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
        shsRequest,
        "INVALID_AUTHORIZATION_CREDENTIAL",
        "",
      );
    }

    return await SHS.handler(shsRequest, this._authorization, this._backend);
  }
}
