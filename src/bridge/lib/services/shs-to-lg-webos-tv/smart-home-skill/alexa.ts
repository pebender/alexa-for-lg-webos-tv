import * as Common from "../../../../../common";
import type { TvControl } from "../tv-manager";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tvControl: TvControl,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa",
    }),
  ];
}

function states(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tvControl: TvControl,
): Array<Promise<Common.SHS.ContextProperty>> {
  return [];
}

function reportStateHandler(
  alexaRequest: Common.SHS.Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tvControl: TvControl,
): Common.SHS.Response {
  const response = new Common.SHS.Response({
    namespace: "Alexa",
    name: "StateReport",
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId(),
  });
  return response;
}

async function handler(
  alexaRequest: Common.SHS.Request,
  tvControl: TvControl,
): Promise<Common.SHS.Response> {
  switch (alexaRequest.directive.header.name) {
    case "ReportState": {
      return await Promise.resolve(reportStateHandler(alexaRequest, tvControl));
    }
    default: {
      return await Promise.resolve(
        Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
    }
  }
}

export { capabilities, states, handler };
