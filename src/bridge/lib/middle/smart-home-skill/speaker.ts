import LGTV from "lgtv2";
import * as Common from "../../../../common";
import { BackendControl } from "../../backend";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Promise<Common.SHS.EventPayloadEndpointCapability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.Speaker",
      propertyNames: ["volume", "muted"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.ContextProperty | null>[] {
  function getVolumeState(): Promise<Common.SHS.ContextProperty | null> {
    async function value(): Promise<number> {
      const lgtvRequest: LGTV.Request = {
        uri: "ssap://audio/getVolume",
      };
      const lgtvResponse: LGTV.ResponseVolume =
        (await backendControl.lgtvCommand(lgtvRequest)) as LGTV.ResponseVolume;
      if (typeof lgtvResponse.volume !== "number") {
        throw Common.Error.create({
          message: "invalid response from the TV",
          general: "tv",
          specific: "invalidResponse",
        });
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

  function getMutedState(): Promise<Common.SHS.ContextProperty | null> {
    async function value(): Promise<boolean> {
      const lgtvRequest: LGTV.Request = {
        uri: "ssap://audio/getVolume",
      };
      const lgtvResponse: LGTV.ResponseVolume =
        (await backendControl.lgtvCommand(lgtvRequest)) as LGTV.ResponseVolume;
      if (typeof lgtvResponse.muted !== "boolean") {
        throw Common.Error.create({
          message: "invalid response from the TV",
          general: "tv",
          specific: "invalidResponse",
        });
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
): Promise<Common.SHS.Response> {
  /* get volume */
  const { volume } = alexaRequest.directive.payload;
  if (typeof volume !== "number") {
    return Common.SHS.Response.buildAlexaErrorResponseForInvalidValue(
      alexaRequest,
    );
  }
  if (volume < 0 || volume > 100) {
    return Common.SHS.Response.buildAlexaErrorResponseForValueOutOfRange(
      alexaRequest,
      { minimumValue: 0, maximumValue: 100 },
    );
  }

  /* set volume */
  const lgtvRequest: LGTV.Request = {
    uri: "ssap://audio/setVolume",
    payload: { volume },
  };
  try {
    await backendControl.lgtvCommand(lgtvRequest);
  } catch (error) {
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }
  return Common.SHS.Response.buildAlexaResponse(alexaRequest);
}

async function adjustVolumeHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  async function getVolume(): Promise<number> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://audio/getVolume",
    };
    const lgtvResponse: LGTV.ResponseVolume = (await backendControl.lgtvCommand(
      lgtvRequest,
    )) as LGTV.ResponseVolume;
    if (typeof lgtvResponse.volume === "undefined") {
      throw Common.Error.create({
        message: "the T.V. did not return it's volume",
        general: "tv",
        specific: "responseInvalidFormat",
      });
    }
    let volume = lgtvResponse.volume;
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

  async function setVolume(volume: number): Promise<Common.SHS.Response> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://audio/setVolume",
      payload: { volume },
    };
    try {
      await backendControl.lgtvCommand(lgtvRequest);
    } catch (error) {
      return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
        alexaRequest,
        error,
      );
    }
    return Common.SHS.Response.buildAlexaResponse(alexaRequest);
  }

  let lgtvVolume: number;
  try {
    lgtvVolume = await getVolume();
  } catch (error) {
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }

  return setVolume(lgtvVolume);
}

function setMuteHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  async function setMute(): Promise<Common.SHS.Response> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://audio/setMute",
      payload: { mute: alexaRequest.directive.payload.mute as boolean },
    };
    await backendControl.lgtvCommand(lgtvRequest);
    return Common.SHS.Response.buildAlexaResponse(alexaRequest);
  }

  return setMute();
}

function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  if (backendControl.getPowerState() === "OFF") {
    return Promise.resolve(
      Common.SHS.Response.buildAlexaErrorResponseForPowerOff(alexaRequest),
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
        Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
  }
}

export { capabilities, states, handler };
