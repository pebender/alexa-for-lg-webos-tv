import * as Database from "../database";
import * as Common from "../../../common";

export interface Request {
  [x: string]: number | string | object | undefined;
}

export interface Response {
  error?: {
    name?: string;
    message?: string;
  };
  [x: string]: number | string | object | undefined;
}

async function getBridgeInformation(
  alexaRequest: Common.SHS.Request,
): Promise<Database.BridgeInformation> {
  Common.Debug.debug("getBridgeInformation: alexaRequest:");
  Common.Debug.debugJSON(alexaRequest);

  async function queryBridgeInformation(
    skillToken: string,
  ): Promise<Database.BridgeInformation | null> {
    const bridgeInformation = await Database.getBridgeInformation(skillToken);
    if (bridgeInformation !== null) {
      return bridgeInformation;
    } else {
      return null;
    }
  }

  const accessToken = alexaRequest.getAccessToken();
  let bridgeInformation: Database.BridgeInformation | null = null;

  bridgeInformation = await queryBridgeInformation(accessToken);
  if (bridgeInformation !== null) {
    return bridgeInformation;
  }
  const email = await alexaRequest.getUserEmail();
  await Database.setSkillToken(email, accessToken);

  bridgeInformation = await queryBridgeInformation(accessToken);
  if (bridgeInformation !== null) {
    return bridgeInformation;
  }

  throw Common.Error.create("", {
    general: "authorization",
    specific: "bridgeHostname_or_bridgeToken_not_found",
    receiver: "skill_user_db",
    sender: "skill",
  });
}

async function sendHandler(
  path: string,
  alexaRequest: Common.SHS.Request,
  message: Request,
): Promise<Common.SHS.ResponseWrapper> {
  const { hostname, bridgeToken } = await getBridgeInformation(alexaRequest);

  const requestOptions: Common.HTTPSRequest.RequestOptions = {
    hostname,
    path,
    port: Common.constants.bridge.port.https,
    method: "POST",
    headers: {},
  };

  const response = await Common.HTTPSRequest.request(
    requestOptions,
    bridgeToken,
    message,
  );

  return new Common.SHS.ResponseWrapper(alexaRequest, response);
}

function mapErrorToAlexaResponse(
  alexaRequest: Common.SHS.Request,
  error: Common.Error.AlexaForLGwebOSTVError,
): Common.SHS.ResponseWrapper {
  switch (error.general) {
    case "http":
      switch (error.specific) {
        case "CONNECTION_INTERRUPTED":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            "Bridge connect interrupted.",
          );
        case "STATUS_CODE_MISSING":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            "Bridge response included no HTTP status code.",
          );
        case "INVALID_AUTHORIZATION_CREDENTIAL":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INVALID_AUTHORIZATION_CREDENTIAL",
            "Failed to retrieve user profile.",
          );
        case "INTERNAL_ERROR":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            "Failed to retrieve user profile.",
          );
        case "CONTENT_TYPE_MISSING":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            "Bridge response did not return HTTP header 'content-type'.",
          );
        case "CONTENT_TYPE_INCORRECT":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            `Bridge response HTTP header 'content-type' was not 'application/json'.`,
          );
        case "BODY_MISSING":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            "Bridge did not return a body.",
          );
        case "BODY_INVALID_FORMAT":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            "Bridge returned a malformed body.",
          );
        case "UNKNOWN_ERROR":
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            "error: unknown.",
          );
        default:
          return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            "error: unknown.",
          );
      }
    default:
      return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
        alexaRequest,
        "INTERNAL_ERROR",
        "error: unknown.",
      );
  }
}

export async function sendSkillDirective(
  request: Common.SHS.Request,
): Promise<Common.SHS.ResponseWrapper> {
  const shsPath: string = `${Common.constants.bridge.path.service}`;
  try {
    return await sendHandler(shsPath, request, request);
  } catch (error: any) {
    return mapErrorToAlexaResponse(request, error);
  }
}
