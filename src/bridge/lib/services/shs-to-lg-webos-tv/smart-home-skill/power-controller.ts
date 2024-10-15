import * as Common from "../../../../../common";
import { type TvControl, TvCommonError } from "../tv-manager";

function capabilities(
  tvControl: TvControl,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.PowerController",
      propertyNames: ["powerState"],
    }),
  ];
}

function states(
  tvControl: TvControl,
): Array<Promise<Common.SHS.ContextProperty | null>> {
  async function value(): Promise<string> {
    return await Promise.resolve(tvControl.getPowerState() as string);
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
  tvControl: TvControl,
): Common.SHS.Response {
  const poweredOff = tvControl.turnOff();
  if (!poweredOff) {
    const error = new TvCommonError({
      message: "TV power off failed.",
      tv: tvControl.tv,
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
  tvControl: TvControl,
): Promise<Common.SHS.Response> {
  const poweredOn = await tvControl.turnOn();
  if (!poweredOn) {
    const error = new TvCommonError({
      message: "TV power on failed.",
      tv: tvControl.tv,
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
  tvControl: TvControl,
): Promise<Common.SHS.Response> {
  switch (alexaRequest.directive.header.name) {
    case "TurnOff": {
      return await Promise.resolve(turnOffHandler(alexaRequest, tvControl));
    }
    case "TurnOn": {
      return await turnOnHandler(alexaRequest, tvControl);
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
