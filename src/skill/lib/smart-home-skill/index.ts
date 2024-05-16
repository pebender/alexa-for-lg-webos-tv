import type * as AWSLambda from "aws-lambda";
import * as Common from "../../../common";
import * as alexaAuthorization from "./authorization";
import * as alexaDiscovery from "./discovery";
import * as Bridge from "./bridge-api";

async function handlerWithErrors(
  alexaRequest: Common.SHS.Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: AWSLambda.Context,
): Promise<Common.SHS.Response> {
  if (alexaRequest.directive.endpoint?.endpointId === undefined) {
    switch (alexaRequest.directive.header.namespace) {
      case "Alexa.Authorization": {
        return await alexaAuthorization.handler(alexaRequest);
      }
      case "Alexa.Discovery": {
        return await alexaDiscovery.handler(alexaRequest);
      }
      default: {
        return Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveNamespace(
          alexaRequest,
        );
      }
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
  Common.Debug.debugJSON(alexaRequest);

  let alexaResponse: Common.SHS.Response;
  try {
    alexaResponse = await handlerWithErrors(alexaRequest, context);
  } catch (error) {
    if (error instanceof Common.SHS.Response) {
      alexaResponse = error;
    } else {
      alexaResponse =
        Common.SHS.Response.buildAlexaErrorResponseForInternalError(
          alexaRequest,
          error,
        );
    }
    Common.Debug.debug("smart home skill response message");
    Common.Debug.debugJSON(alexaResponse);
  }

  return alexaResponse;
}

export { handler };
