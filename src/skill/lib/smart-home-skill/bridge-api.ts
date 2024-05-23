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
  if (error instanceof Link.HTTPSRequest.HttpCommonError) {
    switch (error.code) {
      case "connectionInterrupted": {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INTERNAL_ERROR",
          "Bridge connect interrupted.",
        );
      }
      case "statusCodeNotFound": {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INTERNAL_ERROR",
          "Bridge response included no HTTP status code.",
        );
      }
      case "unauthorized": {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INVALID_AUTHORIZATION_CREDENTIAL",
          "Failed to retrieve user profile.",
        );
      }
      case "internalServerError": {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INTERNAL_ERROR",
          "Failed to retrieve user profile.",
        );
      }
      case "contentTypeNotFound": {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INTERNAL_ERROR",
          "Bridge response did not return HTTP header 'content-type'.",
        );
      }
      case "contentTypeValueInvalid": {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INTERNAL_ERROR",
          `Bridge response HTTP header 'content-type' was not 'application/json'.`,
        );
      }
      case "bodyNotFound": {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INTERNAL_ERROR",
          "Bridge did not return a body.",
        );
      }
      case "bodyFormatInvalid": {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "INTERNAL_ERROR",
          "Bridge returned a malformed body.",
        );
      }
      case "unknown": {
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
