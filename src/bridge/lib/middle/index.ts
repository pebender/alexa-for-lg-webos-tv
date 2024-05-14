import Ajv from "ajv/dist/2019";
import * as AjvTypes from "ajv";
import ajvFormats from "ajv-formats";
import LGTV from "lgtv2";
import * as Common from "../../../common";
import { Configuration } from "../configuration";
import { Backend } from "../backend";
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

  public static async build(configuration: Configuration, backend: Backend) {
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
    uriList.forEach((uri) => {
      middle._backend.on(
        uri,
        (
          error: Common.Error.CommonError,
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
    });

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
    } catch (c) {
      const cause: Common.Error.CommonError = c as Common.Error.CommonError;
      if (
        typeof cause.general === "string" &&
        cause.general === "authorization"
      ) {
        authorized = false;
      } else {
        return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
          shsRequest,
          c,
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

    // Check SHS Response against the SHS schema.
    try {
      const valid = this._responseSchemaValidator(shsResponse);
      if (!valid) {
        const error = Common.Error.create({
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
      } else {
        Common.Debug.debug(
          "Smart Home Skill Response schema validation passed",
        );
      }
    } catch (error) {
      shsResponse = Common.SHS.Response.buildAlexaErrorResponseForInternalError(
        shsRequest,
        error,
      );
    }

    return shsResponse;
  }
}
