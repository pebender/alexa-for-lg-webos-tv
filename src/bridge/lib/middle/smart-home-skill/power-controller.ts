import * as Common from "../../../../common";
import { BackendControl } from "../../backend";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.PowerController",
      propertyNames: ["powerState"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.Context.Property | null>[] {
  function value(): Promise<string> {
    return Promise.resolve(backendControl.getPowerState() as string);
  }

  const powerStateState = Common.SHS.Response.buildContextProperty({
    namespace: "Alexa.PowerController",
    name: "powerState",
    value,
  });
  return [powerStateState];
}

function turnOffHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Common.SHS.ResponseWrapper {
  const poweredOff = backendControl.turnOff();
  if (!poweredOff) {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
      alexaRequest,
    );
  }
  return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
}

async function turnOnHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  const poweredOn = await backendControl.turnOn();
  if (!poweredOn) {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
      alexaRequest,
    );
  }
  return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
}

function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  switch (alexaRequest.directive.header.name) {
    case "TurnOff":
      return Promise.resolve(turnOffHandler(alexaRequest, backendControl));
    case "TurnOn":
      return turnOnHandler(alexaRequest, backendControl);
    default:
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
  }
}

export { capabilities, states, handler };
