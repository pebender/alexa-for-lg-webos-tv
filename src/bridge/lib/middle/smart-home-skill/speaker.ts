import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
import LGTV from "lgtv2";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.Speaker",
      propertyNames: ["volume", "muted"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.Context.Property>[] {
  function getVolumeState(): Promise<Common.SHS.Context.Property> {
    async function value(): Promise<number> {
      const lgtvRequest: LGTV.Request = {
        uri: "ssap://audio/getVolume",
      };
      const lgtvResponse: LGTV.ResponseVolume =
        (await backendControl.lgtvCommand(lgtvRequest)) as LGTV.ResponseVolume;
      if (typeof lgtvResponse.volume !== "number") {
        throw new Error("invalid lgtvCommand response");
      }
      return lgtvResponse.volume;
    }

    const volumeState = Common.SHS.Response.buildContextProperty({
      namespace: "Alexa.Speaker",
      name: "volume",
      value,
    });
    return volumeState;
  }

  function getMutedState(): Promise<Common.SHS.Context.Property> {
    async function value(): Promise<boolean> {
      const lgtvRequest: LGTV.Request = {
        uri: "ssap://audio/getVolume",
      };
      const lgtvResponse: LGTV.ResponseVolume =
        (await backendControl.lgtvCommand(lgtvRequest)) as LGTV.ResponseVolume;
      if (typeof lgtvResponse.muted !== "boolean") {
        throw new Error("invalid lgtvCommand response");
      }
      return lgtvResponse.muted;
    }

    const mutedState = Common.SHS.Response.buildContextProperty({
      namespace: "Alexa.Speaker",
      name: "muted",
      value,
    });
    return mutedState;
  }

  if (backendControl.getPowerState() === "OFF") {
    return [];
  }

  return [getVolumeState(), getMutedState()];
}

async function setVolumeHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  function getVolume(): number {
    const { volume } = alexaRequest.directive.payload;
    if (typeof volume !== "number") {
      throw Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
        alexaRequest,
      );
    }
    if (volume < 0 || volume > 100) {
      throw Common.SHS.ResponseWrapper.buildAlexaErrorResponseForValueOutOfRange(
        alexaRequest,
        { minimumValue: 0, maximumValue: 100 },
      );
    }
    return volume;
  }

  async function setVolume(
    volume: number,
  ): Promise<Common.SHS.ResponseWrapper> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://audio/setVolume",
      payload: { volume },
    };
    try {
      await backendControl.lgtvCommand(lgtvRequest);
    } catch (error) {
      return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
        alexaRequest,
        200,
        error,
      );
    }
    return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
  }

  let lgtvVolume: number = -1;
  try {
    lgtvVolume = await getVolume();
  } catch (error) {
    if (error instanceof Common.SHS.ResponseWrapper) {
      return error;
    } else {
      return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
        alexaRequest,
        200,
        error,
      );
    }
  }
  return setVolume(lgtvVolume);
}

async function adjustVolumeHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  async function getVolume(): Promise<number> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://audio/getVolume",
    };
    const lgtvResponse: LGTV.ResponseVolume = (await backendControl.lgtvCommand(
      lgtvRequest,
    )) as LGTV.ResponseVolume;
    if (typeof lgtvResponse.volume === "undefined") {
      throw new Error("the T.V. did not return it's volume");
    }
    let volume = lgtvResponse.volume as number;
    if (typeof alexaRequest.directive.payload.volume !== "undefined") {
      if (alexaRequest.directive.payload.volumeDefault === true) {
        if ((alexaRequest.directive.payload.volume as number) < 0) {
          volume -= 3;
        } else if ((alexaRequest.directive.payload.volume as number) > 0) {
          volume += 3;
        }
      } else {
        volume += alexaRequest.directive.payload.volume as number;
      }
    }
    if (volume < 0) {
      volume = 0;
    }
    if (volume > 100) {
      volume = 100;
    }
    return volume;
  }

  async function setVolume(
    volume: number,
  ): Promise<Common.SHS.ResponseWrapper> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://audio/setVolume",
      payload: { volume },
    };
    await backendControl.lgtvCommand(lgtvRequest);
    return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
  }

  let lgtvVolume: number = -1;
  try {
    lgtvVolume = await getVolume();
  } catch (error) {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      200,
      error,
    );
  }

  return setVolume(lgtvVolume);
}

function setMuteHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  async function setMute(): Promise<Common.SHS.ResponseWrapper> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://audio/setMute",
      payload: { mute: alexaRequest.directive.payload.mute as boolean },
    };
    await backendControl.lgtvCommand(lgtvRequest);
    return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
  }

  return setMute();
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
    case "SetVolume":
      return setVolumeHandler(alexaRequest, backendControl);
    case "AdjustVolume":
      return adjustVolumeHandler(alexaRequest, backendControl);
    case "SetMute":
      return setMuteHandler(alexaRequest, backendControl);
    default:
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
  }
}

export { capabilities, states, handler };
