import * as Common from "../../../../common";
import { BackendControl } from "../../backend";

function capabilities(
  backendControl: BackendControl
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa",
    }),
  ];
}

function states(
  backendControl: BackendControl
): Promise<Common.SHS.Context.Property>[] {
  return [];
}

function reportStateHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl
): Common.SHS.ResponseWrapper {
  const response = new Common.SHS.Response({
    namespace: "Alexa",
    name: "StateReport",
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId(),
  });
  return new Common.SHS.ResponseWrapper(alexaRequest, response);
}

function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl
): Promise<Common.SHS.ResponseWrapper> {
  switch (alexaRequest.directive.header.name) {
    case "ReportState":
      return Promise.resolve(reportStateHandler(alexaRequest, backendControl));
    default:
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest
        )
      );
  }
}

export { capabilities, states, handler };
