import type LGTV from "lgtv2";
import * as Common from "../../../../common";
import { type BackendControl, TV } from "../../backend";

interface Channel {
  channelNumber: string;
  channelName: string;
}

async function getChannel(
  backendControl: BackendControl,
): Promise<Channel | null> {
  try {
    const lgtvResponse = await backendControl.lgtvCommand({
      uri: "ssap://tv/getCurrentChannel",
    });
    const channel = lgtvResponse;
    return channel.channelNumber !== undefined &&
      channel.channelName !== undefined
      ? {
          channelNumber: channel.channelNumber as string,
          channelName: channel.channelName as string,
        }
      : null;
  } catch (error) {
    Common.Debug.debugError(error);
    return null;
  }
}

async function getChannels(backendControl: BackendControl): Promise<Channel[]> {
  try {
    const lgtvResponse = await backendControl.lgtvCommand({
      uri: "ssap://tv/getChannelList",
    });
    if (lgtvResponse.channelList === undefined) {
      return [];
    }
    const channelList = lgtvResponse.channelList as Array<{
      channelNumber?: string;
      channelName?: string;
      [key: string]: unknown;
    }>;
    const channels: Channel[] = [];
    for (const channel of channelList) {
      if (
        typeof channel === "object" &&
        typeof channel.channelNumber === "string" &&
        typeof channel.channelName === "string"
      ) {
        channels.push({
          channelNumber: channel.channelNumber,
          channelName: channel.channelName,
        });
      }
    }
    return channels;
  } catch {
    return [];
  }
}

// Creates a sorted channel list used channel skipping.
function getChannelNumbers(channels: Channel[]): string[] {
  const channelNumbers: string[] = channels.map(
    (channel) => channel.channelNumber,
  );
  channelNumbers.sort((a: string, b: string) => {
    const x = a.split("-", 2);
    const y = b.split("-", 2);
    const x0 = Number.parseInt(x[0], 10);
    const y0 = Number.parseInt(y[0], 10);
    if (x0 > y0) {
      return 1;
    }
    if (x0 < y0) {
      return -1;
    }
    if (x.length === 1 && y.length === 1) {
      return 0;
    }
    if (x.length === 2 && y.length === 2) {
      const x1 = Number.parseInt(x[1], 10);
      const y1 = Number.parseInt(y[1], 10);
      if (x1 > y1) {
        return 1;
      }
      if (x1 < y1) {
        return -1;
      }
      return 0;
    }
    if (x.length === 2) {
      return 1;
    }
    if (y.length === 2) {
      return -1;
    }
    return 0;
  });
  return channelNumbers;
}

// Creates a map of channel number to channel number used for channel changing.
// Sometimes people ask for a channel's major number when they want the primary
// minor channel of the major channel. So, an additional mapping of major number
// (e.g. 10) to major number dash primary minor number (e.g. 10-1).
function getChannelNumberToNumberMap(
  channels: Channel[],
): Record<string, string> {
  const channelNumberToNumber: Record<string, string> = {};
  for (const channelItem of channels) {
    const channelNumber: string = channelItem.channelNumber;
    channelNumberToNumber[channelNumber] = channelNumber;
    if (channelNumber.endsWith("-1")) {
      const altChannelName = channelNumber.replace(/-1$/, "");
      if (channelNumberToNumber[altChannelName] === undefined) {
        channelNumberToNumber[altChannelName] = channelNumber;
      }
    }
  }
  return channelNumberToNumber;
}

// Creates a map of channel name to channel number used for channel changing.
// Sometimes an affiliate will name its primary channel <call-sign>-HD,
// <call-sign>-DT or <call-sign>HD. So, when a channel name ending in -HD, -DT
// or HD is encountered, an additional mapping with the ending removed is
// created.
function getChannelNameToNumberMap(
  channels: Channel[],
): Record<string, string> {
  const channelNameToNumber: Record<string, string> = {};
  for (const channelItem of channels) {
    const channelNumber: string = channelItem.channelNumber;
    const channelName: string = channelItem.channelName.toUpperCase();
    channelNameToNumber[channelName] = channelNumber;
    if (channelName.endsWith("-DT")) {
      const altChannelName = channelName.replace(/-DT$/, "");
      if (channelNameToNumber[altChannelName] === undefined) {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
    if (channelName.endsWith("-HD")) {
      const altChannelName = channelName.replace(/-HD$/, "");
      if (channelNameToNumber[altChannelName] === undefined) {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
    if (channelName.endsWith("HD")) {
      const altChannelName = channelName.replace(/HD$/, "");
      if (channelNameToNumber[altChannelName] === undefined) {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
  }
  return channelNameToNumber;
}

async function activateLiveTv(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<void> {
  let isLiveTv = false;
  let lgtvRequest: LGTV.Request = {
    uri: "ssap://com.webos.applicationManager/getForegroundAppInfo",
  };
  try {
    const lgtvResponse = await backendControl.lgtvCommand(lgtvRequest);
    isLiveTv = lgtvResponse.appId === "com.webos.app.livetv";
  } catch {
    isLiveTv = false;
  }
  if (!isLiveTv) {
    lgtvRequest = {
      uri: "ssap://system.launcher/launch",
      payload: { id: "com.webos.app.livetv" },
    };
    try {
      await backendControl.lgtvCommand(lgtvRequest);
    } catch (error) {
      Common.Debug.debugError(error);
    }
  }
}

async function setChannel(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
  channelNumber: string | null,
): Promise<Common.SHS.Response> {
  if (channelNumber === null) {
    return Common.SHS.Response.buildAlexaErrorResponseForInvalidValue(
      alexaRequest,
    );
  }
  const lgtvRequest: LGTV.Request = {
    uri: "ssap://tv/openChannel",
    payload: { channelNumber },
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

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.ChannelController",
      propertyNames: ["channel"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Array<Promise<Common.SHS.ContextProperty | null>> {
  if (backendControl.getPowerState() === "OFF") {
    return [];
  }

  async function value(): Promise<{
    number?: string;
    callSign?: string;
    affiliateCallSign?: string;
  }> {
    /* Check that TV has live TV in the foreground */
    {
      const lgtvRequest: LGTV.Request = {
        uri: "ssap://com.webos.applicationManager/getForegroundAppInfo",
      };
      const lgtvResponse: LGTV.Response =
        await backendControl.lgtvCommand(lgtvRequest);
      if (typeof lgtvResponse.appId !== "string") {
        throw new TV.TvCommonError({
          code: "responseInvalid",
          message: "TV response was invalid",
          tv: backendControl.tv,
          request: lgtvRequest,
          response: lgtvResponse,
        });
      }
      if (lgtvResponse.appId !== "com.webos.app.livetv") {
        throw new TV.TvCommonError({
          code: "requestInvalidInCurrentState",
          message: "TV channel requested when TV was not tuned to a channel",
          tv: backendControl.tv,
          request: lgtvRequest,
          response: lgtvResponse,
        });
      }
    }

    /* Get the current channel */
    {
      const lgtvRequest: LGTV.Request = {
        uri: "ssap://tv/getCurrentChannel",
      };
      const lgtvResponse: LGTV.Response =
        await backendControl.lgtvCommand(lgtvRequest);

      const channel: {
        number?: string;
        callSign?: string;
        affiliateCallSign?: string;
      } = {};
      if (lgtvResponse.channelNumber !== undefined) {
        channel.number = lgtvResponse.channelNumber as string;
      }
      if (lgtvResponse.channelName !== undefined) {
        channel.affiliateCallSign = (
          lgtvResponse.channelName as string
        ).toUpperCase();
      }
      return channel;
    }
  }

  const channelState = Common.SHS.Response.buildContextProperty({
    namespace: "Alexa.ChannelController",
    name: "channel",
    value,
  });

  return [channelState];
}

async function skipChannelsHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  await activateLiveTv(alexaRequest, backendControl);
  const currentChannel = await getChannel(backendControl);
  if (currentChannel === null) {
    return Common.SHS.Response.buildAlexaErrorResponseNotSupportedInCurrentMode(
      alexaRequest,
      `${backendControl.tv.name} (${backendControl.tv.udn}) is not currently watching a TV channel.`,
    );
  }
  let channels: Channel[];
  try {
    channels = await getChannels(backendControl);
  } catch (error) {
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }
  const channelNumbers = getChannelNumbers(channels);
  const channelCount = Number.parseInt(
    alexaRequest.directive.payload.channelCount as string,
    10,
  );
  const currentChannelIndex = channels.findIndex(
    (channel) => channel.channelNumber === currentChannel.channelNumber,
  );
  const targetChannelIndex =
    (currentChannelIndex +
      (channelCount % channelNumbers.length) +
      channelNumbers.length) %
    channelNumbers.length;
  const targetChannel = channelNumbers[targetChannelIndex];
  try {
    return await setChannel(alexaRequest, backendControl, targetChannel);
  } catch (error) {
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }
}

async function changeChannelHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  let channels: Channel[];
  try {
    channels = await getChannels(backendControl);
  } catch (error) {
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }
  const channelNumberToNumber = getChannelNumberToNumberMap(channels);
  const channelNameToNumber = getChannelNameToNumberMap(channels);

  function getChannelNumber(): string | null {
    if (alexaRequest.directive.payload !== undefined) {
      const payload: {
        channel?: {
          number?: string;
          callSign?: string;
          affiliateCallSign?: string;
          [x: string]: boolean | number | string | object | undefined;
        };
        channelMetadata?: {
          name?: string;
          [x: string]: boolean | number | string | object | undefined;
        };
        [x: string]: boolean | number | string | object | undefined;
      } = alexaRequest.directive.payload;
      if (
        payload.channel?.number !== undefined &&
        channelNumberToNumber[payload.channel.number] !== undefined
      ) {
        return channelNumberToNumber[payload.channel.number];
      }
      if (
        payload.channel?.affiliateCallSign !== undefined &&
        channelNameToNumber[payload.channel.affiliateCallSign] !== undefined
      ) {
        return channelNameToNumber[payload.channel.affiliateCallSign];
      }
      if (
        payload.channel?.callSign !== undefined &&
        channelNameToNumber[payload.channel.callSign] !== undefined
      ) {
        return channelNameToNumber[payload.channel.callSign];
      }
    }
    return null;
  }

  const channelNumber = getChannelNumber();
  if (channelNumber === null) {
    return Common.SHS.Response.buildAlexaErrorResponseForInvalidValue(
      alexaRequest,
    );
  }
  await activateLiveTv(alexaRequest, backendControl);
  try {
    return await setChannel(alexaRequest, backendControl, channelNumber);
  } catch (error) {
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      error,
    );
  }
}

async function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  if (backendControl.getPowerState() === "OFF") {
    return await Promise.resolve(
      Common.SHS.Response.buildAlexaErrorResponseForPowerOff(alexaRequest),
    );
  }
  switch (alexaRequest.directive.header.name) {
    case "ChangeChannel": {
      return await changeChannelHandler(alexaRequest, backendControl);
    }
    case "SkipChannels": {
      return await skipChannelsHandler(alexaRequest, backendControl);
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
