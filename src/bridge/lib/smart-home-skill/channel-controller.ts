import * as ASH from '../../../common/smart-home-skill'
import { BackendControl } from '../backend'
import LGTV from 'lgtv2'
const isNumeric = require('isnumeric')

function capabilities (backendControl: BackendControl): Promise<ASH.AlexaResponseEventPayloadEndpointCapability>[] {
  return [ASH.AlexaResponse.buildPayloadEndpointCapability({
    namespace: 'Alexa.ChannelController'
  })]
}

function states (backendControl: BackendControl): Promise<ASH.AlexaResponseContextProperty>[] {
  return []
}

function skipChannelsHandler (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): Promise<ASH.AlexaResponse> {
  return Promise.resolve(ASH.errorResponse(alexaRequest, null, 'UNKNOWN_ERROR', '\'Alexa.ChannelController.SkipChannels\' is not supported.').response)
}

function unknownChannelError (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): ASH.AlexaResponse {
  return ASH.errorResponse(alexaRequest, null, 'INVALID_VALUE', 'The bridge  doesn\'t recognize channel.').response
}

async function changeChannelHandler (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): Promise<ASH.AlexaResponse> {
  function getCommand (): LGTV.Request | null {
    const lgtvRequest: LGTV.Request = {
      uri: 'ssap://tv/openChannel'
    }
    if (typeof alexaRequest.directive.payload !== 'undefined') {
      const payload: {
        channel?: {
          number?: number | string;
          callSign?: number | string;
          affiliateCallSign?: number | string;
        };
        channelMetadata?: {
          name?: number | string;
        };
        [x: string]: boolean | number | string | object | undefined;
      } = alexaRequest.directive.payload
      if (typeof payload.channel !== 'undefined' && typeof payload.channel.number !== 'undefined') {
        if (isNumeric(payload.channel.number)) {
          lgtvRequest.payload = { channelNumber: (payload.channel.number as number) }
        } else {
          lgtvRequest.payload = { channelId: (payload.channel.number as string) }
        }
      } else if (typeof payload.channel !== 'undefined' && typeof payload.channel.callSign !== 'undefined') {
        if (isNumeric(payload.channel.callSign)) {
          lgtvRequest.payload = { channelNumber: (payload.channel.callSign as number) }
        } else {
          lgtvRequest.payload = { channelId: (payload.channel.callSign as string) }
        }
      } else if (typeof payload.channel !== 'undefined' && typeof payload.channel.affiliateCallSign !== 'undefined') {
        if (isNumeric(payload.channel.affiliateCallSign)) {
          lgtvRequest.payload = { channelNumber: (payload.channel.affiliateCallSign as number) }
        } else {
          lgtvRequest.payload = { channelId: (payload.channel.affiliateCallSign as string) }
        }
      } else if (typeof payload.channelMetadata !== 'undefined' && typeof payload.channelMetadata.name !== 'undefined') {
        if (isNumeric(payload.channelMetadata.name)) {
          lgtvRequest.payload = { channelNumber: (payload.channelMetadata.name as number) }
        } else {
          lgtvRequest.payload = { channelId: (payload.channelMetadata.name as string) }
        }
      }
    }
    if (typeof lgtvRequest.payload === 'undefined') {
      return null
    }
    return (lgtvRequest as LGTV.Request)
  }

  async function setChannel (lgtvRequest: LGTV.Request | null): Promise<ASH.AlexaResponse> {
    if (lgtvRequest === null) {
      return unknownChannelError(alexaRequest, backendControl)
    }
    try {
      await backendControl.lgtvCommand(lgtvRequest)
    } catch (error) {
      return ASH.errorResponseFromError(alexaRequest, error).response
    }

    //
    // X const [state] = await states(lgtv, null);
    // Dummy 'value' values.
    //
    const state: ASH.AlexaResponseContextProperty = {
      namespace: 'Alexa.ChannelController',
      name: 'channel',
      value: {
        number: '1234',
        callSign: 'callsign1',
        affiliateCallSign: 'callsign2'
      },
      timeOfSample: new Date().toISOString(),
      uncertaintyInMilliseconds: 0
    }
    const alexaResponse = new ASH.AlexaResponse({
      namespace: 'Alexa',
      name: 'Response',
      correlationToken: alexaRequest.getCorrelationToken(),
      endpointId: alexaRequest.getEndpointId()
    })
    alexaResponse.addContextProperty(await ASH.AlexaResponse.buildContextProperty({
      namespace: 'Alexa.ChannelController',
      name: 'channel',
      value: (): {
        'number': string;
        'callSign': string;
        'affiliateCallSign': string;
      } => {
        const value: {
          'number': string;
          'callSign': string;
          'affiliateCallSign': string;
        } = {
          number: '1234',
          callSign: 'callsign1',
          affiliateCallSign: 'callsign2'
        }
        return value
      }
    }))
    return alexaResponse
  }

  const channelCommand = await getCommand()
  return setChannel(channelCommand)
}

function handler (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): Promise<ASH.AlexaResponse> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.ChannelController') {
    throw ASH.errorResponseForWrongDirectiveNamespace(alexaRequest, 'Alexa.ChannelController')
  }
  switch (alexaRequest.directive.header.name) {
    case 'ChangeChannel':
      return changeChannelHandler(alexaRequest, backendControl)
    case 'SkipChannels':
      return skipChannelsHandler(alexaRequest, backendControl)
    default:
      throw ASH.errorResponseForInvalidDirectiveName(alexaRequest)
  }
}

export { capabilities, states, handler }
