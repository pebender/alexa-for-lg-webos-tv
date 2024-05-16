import * as Link from "../link";
import * as Common from "../../../common";

async function sendHandler(
  path: string,
  alexaRequest: Common.SHS.Request,
  message: object,
): Promise<Common.SHS.Response> {
  const response: Common.SHS.Response = (await Link.sendMessageUsingBridgeToken(
    path,
    alexaRequest.getAccessToken(),
    message,
  )) as Common.SHS.Response;
  return response;
}

function mapErrorToAlexaResponse(
  alexaRequest: Common.SHS.Request,
  error: unknown,
): Common.SHS.Response {
  if (error instanceof Common.Error.CommonError) {
    switch (error.general) {
      case "http": {
        switch (error.specific) {
          case "CONNECTION_INTERRUPTED": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              "Bridge connect interrupted.",
            );
          }
          case "STATUS_CODE_MISSING": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              "Bridge response included no HTTP status code.",
            );
          }
          case "INVALID_AUTHORIZATION_CREDENTIAL": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INVALID_AUTHORIZATION_CREDENTIAL",
              "Failed to retrieve user profile.",
            );
          }
          case "INTERNAL_ERROR": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              "Failed to retrieve user profile.",
            );
          }
          case "CONTENT_TYPE_MISSING": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              "Bridge response did not return HTTP header 'content-type'.",
            );
          }
          case "CONTENT_TYPE_INCORRECT": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              `Bridge response HTTP header 'content-type' was not 'application/json'.`,
            );
          }
          case "BODY_MISSING": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              "Bridge did not return a body.",
            );
          }
          case "BODY_INVALID_FORMAT": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              "Bridge returned a malformed body.",
            );
          }
          case "UNKNOWN_ERROR": {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              "error: unknown.",
            );
          }
          default: {
            return Common.SHS.Response.buildAlexaErrorResponse(
              alexaRequest,
              "INTERNAL_ERROR",
              "error: unknown.",
            );
          }
        }
      }
      default: {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INTERNAL_ERROR",
          "error: unknown.",
        );
      }
    }
  } else {
    return Common.SHS.Response.buildAlexaErrorResponse(
      alexaRequest,
      "INTERNAL_ERROR",
      "error: unknown.",
    );
  }
}

export async function sendSkillDirective(
  request: Common.SHS.Request,
): Promise<Common.SHS.Response> {
  const shsPath: string = Common.constants.bridge.path.service;
  try {
    return await sendHandler(shsPath, request, request);
  } catch (error) {
    return mapErrorToAlexaResponse(request, error);
  }
}
