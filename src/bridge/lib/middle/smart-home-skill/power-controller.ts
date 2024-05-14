import * as Common from "../../../../common";
import { BackendControl } from "../../backend";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Promise<Common.SHS.EventPayloadEndpointCapability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.PowerController",
      propertyNames: ["powerState"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.ContextProperty | null>[] {
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
): Common.SHS.Response {
  const poweredOff = backendControl.turnOff();
  if (!poweredOff) {
    const error = Common.Error.create({
      message: "TV power off failed.",
      general: "tv",
    });
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }
  return Common.SHS.Response.buildAlexaResponse(alexaRequest);
}

async function turnOnHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  const poweredOn = await backendControl.turnOn();
  if (!poweredOn) {
    const error = Common.Error.create({
      message: "TV power on failed.",
      general: "tv",
    });
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }
  return Common.SHS.Response.buildAlexaResponse(alexaRequest);
}

function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  switch (alexaRequest.directive.header.name) {
    case "TurnOff":
      return Promise.resolve(turnOffHandler(alexaRequest, backendControl));
    case "TurnOn":
      return turnOnHandler(alexaRequest, backendControl);
    default:
      return Promise.resolve(
        Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
  }
}

export { capabilities, states, handler };
