import * as AWSLambda from "aws-lambda";
import * as Common from "../../../common";
import * as alexaAuthorization from "./authorization";
import * as alexaDiscovery from "./discovery";
import * as Bridge from "./bridge-api";

async function handlerWithErrors(
  alexaRequest: Common.SHS.Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: AWSLambda.Context,
): Promise<Common.SHS.ResponseWrapper> {
  if (
    typeof alexaRequest.directive.endpoint === "undefined" ||
    typeof alexaRequest.directive.endpoint.endpointId === "undefined"
  ) {
    switch (alexaRequest.directive.header.namespace) {
      case "Alexa.Authorization":
        return alexaAuthorization.handler(alexaRequest);
      case "Alexa.Discovery":
        return alexaDiscovery.handler(alexaRequest);
      default:
        throw Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveNamespace(
          alexaRequest,
        );
    }
  } else {
    return await Bridge.sendSkillDirective(alexaRequest);
  }
}

async function handler(
  event: Common.SHS.Request,
  context: AWSLambda.Context,
): Promise<Common.SHS.Response> {
  const alexaRequest = new Common.SHS.Request(event);

  Common.Debug.debug("smart home skill request message");
  Common.Debug.debug(JSON.stringify(alexaRequest, null, 2));

  let alexaResponseWrapper: Common.SHS.ResponseWrapper;
  try {
    alexaResponseWrapper = await handlerWithErrors(alexaRequest, context);
  } catch (error) {
    if (error instanceof Common.SHS.ResponseWrapper) {
      alexaResponseWrapper = error;
    } else {
      alexaResponseWrapper =
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
          alexaRequest,
          200,
          error,
        );
    }
    Common.Debug.debug("smart home skill response message");
    Common.Debug.debug(JSON.stringify(alexaResponseWrapper.response, null, 2));

    if (typeof alexaResponseWrapper.error !== "undefined") {
      Common.Debug.debug("smart home skill error response");
      Common.Debug.debugErrorWithStack(alexaResponseWrapper.error);
    }
    Common.Debug.debug("smart home skill request message");
  }

  return alexaResponseWrapper.response;
}

export { handler };
