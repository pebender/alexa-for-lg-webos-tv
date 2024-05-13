import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
import LGTV from "lgtv2";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Promise<Common.SHS.EventPayloadEndpointCapability>[] {
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
  backendControl: BackendControl,
): Promise<Common.SHS.ContextProperty>[] {
  return [];
}

async function genericHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
  lgtvRequestURI: string,
): Promise<Common.SHS.ResponseWrapper> {
  const lgtvRequest: LGTV.Request = {
    uri: lgtvRequestURI,
  };
  try {
    await backendControl.lgtvCommand(lgtvRequest);
  } catch {
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
  if (backendControl.getPowerState() === "OFF") {
    return Promise.resolve(
      Common.SHS.ResponseWrapper.buildAlexaErrorResponseForPowerOff(
        alexaRequest,
      ),
    );
  }
  switch (alexaRequest.directive.header.name) {
    case "Play":
      return genericHandler(
        alexaRequest,
        backendControl,
        "ssap://media.controls/play",
      );
    case "Pause":
      return genericHandler(
        alexaRequest,
        backendControl,
        "ssap://media.controls/pause",
      );
    case "Stop":
      return genericHandler(
        alexaRequest,
        backendControl,
        "ssap://media.controls/stop",
      );
    case "Rewind":
      return genericHandler(
        alexaRequest,
        backendControl,
        "ssap://media.controls/rewind",
      );
    case "FastForward":
      return genericHandler(
        alexaRequest,
        backendControl,
        "ssap://media.controls/fastForward",
      );
    default:
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
  }
}

export { capabilities, states, handler };
