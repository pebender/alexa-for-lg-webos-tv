import Ajv from "ajv/dist/2019";
import type * as AjvTypes from "ajv";
import ajvFormats from "ajv-formats";
import type LGTV from "lgtv2";
import * as Common from "../../../common";
import type { Configuration } from "../configuration";
import type { Backend } from "../backend";
import { Authorization } from "./authorization";
import * as SHS from "./smart-home-skill";

export class Middle {
  private readonly _authorization: Authorization;
  private readonly _backend: Backend;
  private readonly _ajv: Ajv;
  private readonly _responseSchemaValidator: AjvTypes.ValidateFunction;
  private constructor(
    _authorization: Authorization,
    _backend: Backend,
    _ajv: Ajv,
    _responseSchemaValidator: AjvTypes.ValidateFunction,
  ) {
    this._authorization = _authorization;
    this._backend = _backend;
    this._ajv = _ajv;
    this._responseSchemaValidator = _responseSchemaValidator;
  }

  public static async build(
    configuration: Configuration,
    backend: Backend,
  ): Promise<Middle> {
    const _authorization = await Authorization.build(configuration);

    const _ajv = new Ajv({
      strictTypes: false,
      discriminator: true,
    });
    // ajv-formats does not support the following formats defined in draft-2019-09
    //   'idn-email', 'idn-hostname', 'iri', 'iri-reference'
    ajvFormats(_ajv, [
      "date-time",
      "date",
      "time",
      "duration",
      "email",
      "hostname",
      "ipv4",
      "ipv6",
      "uri",
      "uri-reference",
      "uri-template",
      "uuid",
      "json-pointer",
      "relative-json-pointer",
      "int32",
      "double",
      "regex",
    ]);
    const _responseSchemaValidator = _ajv.compile(Common.SHS.schema);

    const middle = new Middle(
      _authorization,
      backend,
      _ajv,
      _responseSchemaValidator,
    );

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
        (
          error: Common.CommonError,
          response: LGTV.Response,
          udn: string,
        ) => {
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

    /*
     * Check SHS Response against the SHS schema but skill ones for which the
     * validation schema is broken.
     */
    const namespace = shsResponse.event.header.namespace;
    const name = shsResponse.event.header.name;
    if (!(namespace === "Alexa.Discovery" && name === "Discover.Response")) {
      try {
        const invalid = !this._responseSchemaValidator(shsResponse);
        if (invalid) {
          const error = new Common.GeneralCommonError({
            message: "Smart Home Skill Response schema validation failed",
            cause: {
              response: shsResponse,
              errors: this._responseSchemaValidator.errors,
            },
          });
          shsResponse =
            Common.SHS.Response.buildAlexaErrorResponseForInternalError(
              shsRequest,
              error,
            );
        }
      } catch (error) {
        shsResponse =
          Common.SHS.Response.buildAlexaErrorResponseForInternalError(
            shsRequest,
            error,
          );
      }
    }

    return shsResponse;
  }
}
