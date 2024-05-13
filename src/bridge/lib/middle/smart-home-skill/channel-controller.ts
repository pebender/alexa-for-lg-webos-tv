import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
import LGTV from "lgtv2";

type Channel = {
  channelNumber: string;
  channelName: string;
};

async function getChannel(
  backendControl: BackendControl,
): Promise<Channel | null> {
  try {
    const lgtvResponse = await backendControl.lgtvCommand({
      uri: "ssap://tv/getCurrentChannel",
    });
    const channel = lgtvResponse;
    if (
      typeof channel.channelNumber !== "undefined" &&
      typeof channel.channelName !== "undefined"
    ) {
      return {
        channelNumber: channel.channelNumber as string,
        channelName: channel.channelName as string,
      };
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function getChannels(backendControl: BackendControl): Promise<Channel[]> {
  try {
    const lgtvResponse = await backendControl.lgtvCommand({
      uri: "ssap://tv/getChannelList",
    });
    if (typeof lgtvResponse.channelList === "undefined") {
      return [];
    }
    const channelList = lgtvResponse.channelList as {
      channelNumber?: string;
      channelName?: string;
      [key: string]: unknown;
    }[];
    const channels: Channel[] = [];
    channelList.forEach((channel) => {
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
    });
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
    const x0 = parseInt(x[0], 10);
    const y0 = parseInt(y[0], 10);
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
      const x1 = parseInt(x[1], 10);
      const y1 = parseInt(y[1], 10);
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
function getChannelNumberToNumberMap(channels: Channel[]): {
  [x: string]: string;
} {
  const channelNumberToNumber: { [x: string]: string } = {};
  channels.forEach((channelItem) => {
    const channelNumber: string = channelItem.channelNumber;
    channelNumberToNumber[channelNumber] = channelNumber;
    if (channelNumber.match(/-1$/)) {
      const altChannelName = channelNumber.replace(/-1$/, "");
      if (typeof channelNumberToNumber[altChannelName] === "undefined") {
        channelNumberToNumber[altChannelName] = channelNumber;
      }
    }
  });
  return channelNumberToNumber;
}

// Creates a map of channel name to channel number used for channel changing.
// Sometimes an affiliate will name its primary channel <call-sign>-HD,
// <call-sign>-DT or <call-sign>HD. So, when a channel name ending in -HD, -DT
// or HD is encountered, an additional mapping with the ending removed is
// created.
function getChannelNameToNumberMap(channels: Channel[]): {
  [x: string]: string;
} {
  const channelNameToNumber: { [x: string]: string } = {};
  channels.forEach((channelItem: Channel) => {
    const channelNumber: string = channelItem.channelNumber;
    const channelName: string = channelItem.channelName.toUpperCase();
    channelNameToNumber[channelName] = channelNumber;
    if (channelName.match(/-DT$/)) {
      const altChannelName = channelName.replace(/-DT$/, "");
      if (typeof channelNameToNumber[altChannelName] === "undefined") {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
    if (channelName.match(/-HD$/)) {
      const altChannelName = channelName.replace(/-HD$/, "");
      if (typeof channelNameToNumber[altChannelName] === "undefined") {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
    if (channelName.match(/HD$/)) {
      const altChannelName = channelName.replace(/HD$/, "");
      if (typeof channelNameToNumber[altChannelName] === "undefined") {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
  });
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
  } catch (error) {
    isLiveTv = false;
  }
  if (!isLiveTv) {
    lgtvRequest = {
      uri: "ssap://system.launcher/launch",
      payload: { id: "com.webos.app.livetv" },
    };
    try {
      await backendControl.lgtvCommand(lgtvRequest);
    } catch {}
  }
}

async function setChannel(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
  channelNumber: string | null,
): Promise<Common.SHS.ResponseWrapper> {
  if (channelNumber === null) {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
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
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      200,
      error,
    );
  }

  return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
}

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.ChannelController",
      propertyNames: ["channel"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.Context.Property | null>[] {
  if (backendControl.getPowerState() === "OFF") {
    return [];
  }

  async function value(): Promise<{
    number?: string;
    callSign?: string;
    affiliateCallSign?: string;
  }> {
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
    if (typeof lgtvResponse.channelNumber !== "undefined") {
      channel.number = lgtvResponse.channelNumber as string;
    }
    if (typeof lgtvResponse.channelName !== "undefined") {
      channel.affiliateCallSign = (
        lgtvResponse.channelName as string
      ).toUpperCase();
    }
    return channel;
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
): Promise<Common.SHS.ResponseWrapper> {
  await activateLiveTv(alexaRequest, backendControl);
  const currentChannel = await getChannel(backendControl);
  if (currentChannel === null) {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseNotSupportedInCurrentMode(
      alexaRequest,
      `${backendControl.tv.name} (${backendControl.tv.udn}) is not currently watching a TV channel.`,
    );
  }
  let channels: Channel[];
  try {
    channels = await getChannels(backendControl);
  } catch {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
      alexaRequest,
    );
  }
  const channelNumbers = getChannelNumbers(channels);
  const channelCount = parseInt(
    alexaRequest.directive.payload.channelCount as string,
    10,
  );
  const currentChannelIndex = channels.findIndex(
    (channel) => channel.channelNumber === currentChannel.channelNumber,
  );
  const newChannelIndex =
    (currentChannelIndex +
      (channelCount % channelNumbers.length) +
      channelNumbers.length) %
    channelNumbers.length;
  const newChannel = channelNumbers[newChannelIndex];
  try {
    return await setChannel(alexaRequest, backendControl, newChannel);
  } catch {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
      alexaRequest,
    );
  }
}

async function changeChannelHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  let channels: Channel[];
  try {
    channels = await getChannels(backendControl);
  } catch {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
      alexaRequest,
    );
  }
  const channelNumberToNumber = getChannelNumberToNumberMap(channels);
  const channelNameToNumber = getChannelNameToNumberMap(channels);

  function getChannelNumber(): string | null {
    if (typeof alexaRequest.directive.payload !== "undefined") {
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
        typeof payload.channel?.number !== "undefined" &&
        typeof channelNumberToNumber[payload.channel.number] !== "undefined"
      ) {
        return channelNumberToNumber[payload.channel.number];
      }
      if (
        typeof payload.channel?.affiliateCallSign !== "undefined" &&
        typeof channelNameToNumber[payload.channel.affiliateCallSign] !==
          "undefined"
      ) {
        return channelNameToNumber[payload.channel.affiliateCallSign];
      }
      if (
        typeof payload.channel?.callSign !== "undefined" &&
        typeof channelNameToNumber[payload.channel.callSign] !== "undefined"
      ) {
        return channelNameToNumber[payload.channel.callSign];
      }
    }
    return null;
  }

  const channelNumber = getChannelNumber();
  if (channelNumber === null) {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
      alexaRequest,
    );
  }
  await activateLiveTv(alexaRequest, backendControl);
  try {
    return await setChannel(alexaRequest, backendControl, channelNumber);
  } catch {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
      alexaRequest,
    );
  }
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
    case "ChangeChannel":
      return changeChannelHandler(alexaRequest, backendControl);
    case "SkipChannels":
      return skipChannelsHandler(alexaRequest, backendControl);
    default:
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
  }
}

export { capabilities, states, handler };
