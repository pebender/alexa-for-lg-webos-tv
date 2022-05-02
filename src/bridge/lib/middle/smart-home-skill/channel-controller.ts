import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
import LGTV from "lgtv2";

type Channel = {
  channelNumber: string;
  channelName: string;
};

async function getChannel(
  backendControl: BackendControl
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
      Common.Debug.debugJSON(channel);
      return null;
    }
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
    if (typeof lgtvResponse.channelList === "undefined") {
      return [];
    }
    const channelList = lgtvResponse.channelList as any[];
    const channels: Channel[] = [];
    channelList.forEach((channel) => {
      if (
        typeof channel.channelNumber !== "undefined" &&
        typeof channel.channelName !== "undefined"
      ) {
        channels.push({
          channelNumber: channel.channelNumber as string,
          channelName: channel.channelName as string,
        });
      } else {
        Common.Debug.debugJSON(channel);
      }
    });
    return channels;
  } catch {
    return [];
  }
}

function getChannelNumbers(channels: Channel[]): string[] {
  const channelNumbers: string[] = channels.map(
    (channel) => channel.channelNumber
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

function getChannelNameToNumberMap(channels: any[]): {
  [x: string]: string;
} {
  const channelNameToNumber: { [x: string]: string } = {};
  channels.forEach((channelItem) => {
    const channelNumber: string = channelItem.channelNumber;
    const channelName: string = channelItem.channelName.toUpperCase();
    channelNameToNumber[channelName] = channelNumber;
    if (channelName.match(/-DT$/)) {
      Common.Debug.debug(channelName);
      const altChannelName = channelName.replace(/-DT$/, "");
      if (typeof channelNameToNumber[altChannelName] === "undefined") {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
    if (channelName.match(/-HD$/)) {
      Common.Debug.debug(channelName);
      const altChannelName = channelName.replace(/-HD$/, "");
      if (typeof channelNameToNumber[altChannelName] === "undefined") {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
    if (channelName.match(/HD$/)) {
      Common.Debug.debug(channelName);
      const altChannelName = channelName.replace(/HD$/, "");
      if (typeof channelNameToNumber[altChannelName] === "undefined") {
        channelNameToNumber[altChannelName] = channelNumber;
      }
    }
  });
  return channelNameToNumber;
}

async function setChannel(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
  channelNumber: string | null
): Promise<Common.SHS.ResponseWrapper> {
  Common.Debug.debug("setChannel channelNumber:");
  Common.Debug.debugJSON(channelNumber);
  if (channelNumber === null) {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
      alexaRequest
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
      error
    );
  }

  return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
}

function capabilities(
  backendControl: BackendControl
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.ChannelController",
      propertyNames: ["channel"],
    }),
  ];
}

function states(
  backendControl: BackendControl
): Promise<Common.SHS.Context.Property>[] {
  if (backendControl.getPowerState() === "OFF") {
    return [];
  }

  async function value(): Promise<{
    number?: string;
    callSign?: string;
    affiliateCallSign?: string;
  } | null> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://tv/getCurrentChannel",
    };
    Common.Debug.debug("hello");
    let lgtvResponse;
    try {
      lgtvResponse = await backendControl.lgtvCommand(lgtvRequest);
    } catch (error) {
      return null;
    }
    Common.Debug.debugJSON(lgtvResponse);
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
  backendControl: BackendControl
): Promise<Common.SHS.ResponseWrapper> {
  const currentChannel = await getChannel(backendControl);
  if (currentChannel === null) {
    return Common.SHS.ResponseWrapper.buildAlexaErrorResponseNotSupportedInCurrentMode(
      alexaRequest,
      `${backendControl.tv.name} (${backendControl.tv.udn}) is not currently watching a TV channel.`
    );
  }
  const channels = await getChannels(backendControl);
  const channelNumbers = getChannelNumbers(channels);
  const channelCount = parseInt(
    alexaRequest.directive.payload.channelCount as string,
    10
  );
  const currentChannelIndex = channels.findIndex(
    (channel) => channel.channelNumber === currentChannel?.channelNumber
  );
  const newChannelIndex =
    (currentChannelIndex +
      (channelCount % channelNumbers.length) +
      channelNumbers.length) %
    channelNumbers.length;
  const newChannel = channelNumbers[newChannelIndex];
  return await setChannel(alexaRequest, backendControl, newChannel);
}

async function changeChannelHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl
): Promise<Common.SHS.ResponseWrapper> {
  const channel = await getChannel(backendControl);
  const channels = await getChannels(backendControl);
  const channelNumbers = getChannelNumbers(channels);
  const channelNumberToNumber = getChannelNumberToNumberMap(channels);
  const channelNameToNumber = getChannelNameToNumberMap(channels);

  Common.Debug.debug("channel");
  Common.Debug.debugJSON(channel);
  Common.Debug.debug("channels");
  Common.Debug.debugJSON(channels);
  Common.Debug.debug("channelNumbers");
  Common.Debug.debugJSON(channelNumbers);
  Common.Debug.debug("channelNumberToNumber");
  Common.Debug.debugJSON(channelNumberToNumber);
  Common.Debug.debug("channelNameToNumber");
  Common.Debug.debugJSON(channelNameToNumber);

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
  return setChannel(alexaRequest, backendControl, channelNumber);
}

function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl
): Promise<Common.SHS.ResponseWrapper> {
  if (backendControl.getPowerState() === "OFF") {
    return Promise.resolve(
      Common.SHS.ResponseWrapper.buildAlexaErrorResponseForPowerOff(
        alexaRequest
      )
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
          alexaRequest
        )
      );
  }
}

export { capabilities, states, handler };
