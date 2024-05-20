import * as Common from "../../../../common";
import type { BackendControl } from "../../backend";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.PowerController",
      propertyNames: ["powerState"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Array<Promise<Common.SHS.ContextProperty | null>> {
  async function value(): Promise<string> {
    return await Promise.resolve(backendControl.getPowerState() as string);
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
    const error = new Common.Error.TvCommonError({
      message: "TV power off failed.",
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
    const error = new Common.Error.TvCommonError({
      message: "TV power on failed.",
    });
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }
  return Common.SHS.Response.buildAlexaResponse(alexaRequest);
}

async function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  switch (alexaRequest.directive.header.name) {
    case "TurnOff": {
      return await Promise.resolve(
        turnOffHandler(alexaRequest, backendControl),
      );
    }
    case "TurnOn": {
      return await turnOnHandler(alexaRequest, backendControl);
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
