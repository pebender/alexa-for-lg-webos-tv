import type LGTV from "lgtv2";
import * as Common from "../../../common";
import type { Configuration } from "../configuration";
import type { Backend } from "../backend";
import { Authorization } from "./authorization";
import * as SHS from "./smart-home-skill";

export class Middle {
  private readonly _authorization: Authorization;
  private readonly _backend: Backend;
  private constructor(_authorization: Authorization, _backend: Backend) {
    this._authorization = _authorization;
    this._backend = _backend;
  }

  public static async build(
    configuration: Configuration,
    backend: Backend,
  ): Promise<Middle> {
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

  public getSkillToken(rawRequest: object): string {
    const shsRequest = new Common.SHS.Request(rawRequest as Common.SHS.Request);
    return shsRequest.getAccessToken();
  }

  public async handler(rawRequest: object): Promise<Common.SHS.Response> {
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
