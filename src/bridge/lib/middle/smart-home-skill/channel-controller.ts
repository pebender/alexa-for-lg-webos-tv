import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
import LGTV from "lgtv2";

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

function skipChannelsHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl
): Promise<Common.SHS.ResponseWrapper> {
  return Promise.resolve(
    Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
      alexaRequest
    )
  );
}

async function changeChannelHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl
): Promise<Common.SHS.ResponseWrapper> {
  async function getChannelList(): Promise<any[]> {
    const lgtvResponse = await backendControl.lgtvCommand({
      uri: "ssap://tv/getChannelList",
    });
    return lgtvResponse.channelList as any[];
  }

  function getChannelNumberToNumberMap(channelList: any[]): {
    [x: string]: string;
  } {
    const channelNumberToNumber: { [x: string]: string } = {};
    channelList.forEach((channelItem) => {
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

  function getChannelNameToNumberMap(channelList: any[]): {
    [x: string]: string;
  } {
    const channelNameToNumber: { [x: string]: string } = {};
    channelList.forEach((channelItem) => {
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

  const channelList = await getChannelList();
  const channelNumberToNumber = getChannelNumberToNumberMap(channelList);
  const channelNameToNumber = getChannelNameToNumberMap(channelList);

  Common.Debug.debugJSON(channelNumberToNumber);
  Common.Debug.debugJSON(channelNameToNumber);

  async function getCommand(): Promise<LGTV.Request | null> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://tv/openChannel",
    };
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
        typeof lgtvRequest.payload === "undefined" &&
        typeof payload.channel?.number !== "undefined" &&
        typeof channelNumberToNumber[payload.channel.number] !== "undefined"
      ) {
        lgtvRequest.payload = {
          channelNumber: channelNumberToNumber[payload.channel.number],
        };
      }
      if (
        typeof lgtvRequest.payload === "undefined" &&
        typeof payload.channel?.affiliateCallSign !== "undefined" &&
        typeof channelNameToNumber[payload.channel.affiliateCallSign] !==
          "undefined"
      ) {
        lgtvRequest.payload = {
          channelNumber: channelNameToNumber[payload.channel.affiliateCallSign],
        };
      }
      if (
        typeof lgtvRequest.payload === "undefined" &&
        typeof payload.channel?.callSign !== "undefined" &&
        typeof channelNameToNumber[payload.channel.callSign] !== "undefined"
      ) {
        lgtvRequest.payload = {
          channelNumber: channelNameToNumber[payload.channel.callSign],
        };
      }
    }
    if (typeof lgtvRequest.payload === "undefined") {
      return null;
    }
    return lgtvRequest as LGTV.Request;
  }

  async function setChannel(
    lgtvRequest: LGTV.Request | null
  ): Promise<Common.SHS.ResponseWrapper> {
    Common.Debug.debug("setChannel lgtvRequest:");
    Common.Debug.debugJSON(lgtvRequest);
    if (lgtvRequest === null) {
      return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
        alexaRequest
      );
    }
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

  const channelCommand = await getCommand();
  return setChannel(channelCommand);
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
