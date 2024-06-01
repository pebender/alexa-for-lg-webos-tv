import type LGTV from "lgtv2";
import * as Common from "../../../../../common";
import type { TvControl } from "../tv-manager";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tvControl: TvControl,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [
    Promise.resolve({
      type: "AlexaInterface",
      interface: "Alexa.PlaybackController",
      version: "3",
      supportedOperations: ["Play", "Pause", "Stop", "Rewind", "FastForward"],
    }),
  ];
}

function states(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tvControl: TvControl,
): Array<Promise<Common.SHS.ContextProperty>> {
  return [];
}

async function genericHandler(
  alexaRequest: Common.SHS.Request,
  tvControl: TvControl,
  lgtvRequestURI: string,
): Promise<Common.SHS.Response> {
  const lgtvRequest: LGTV.Request = {
    uri: lgtvRequestURI,
  };
  try {
    await tvControl.lgtvCommand(lgtvRequest);
  } catch (error) {
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
  if (tvControl.getPowerState() === "OFF") {
    return await Promise.resolve(
      Common.SHS.Response.buildAlexaErrorResponseForPowerOff(alexaRequest),
    );
  }
  switch (alexaRequest.directive.header.name) {
    case "Play": {
      return await genericHandler(
        alexaRequest,
        tvControl,
        "ssap://media.controls/play",
      );
    }
    case "Pause": {
      return await genericHandler(
        alexaRequest,
        tvControl,
        "ssap://media.controls/pause",
      );
    }
    case "Stop": {
      return await genericHandler(
        alexaRequest,
        tvControl,
        "ssap://media.controls/stop",
      );
    }
    case "Rewind": {
      return await genericHandler(
        alexaRequest,
        tvControl,
        "ssap://media.controls/rewind",
      );
    }
    case "FastForward": {
      return await genericHandler(
        alexaRequest,
        tvControl,
        "ssap://media.controls/fastForward",
      );
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
