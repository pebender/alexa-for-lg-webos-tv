import * as ASH from '../../../common/alexa'
import { BackendControl } from '../backend'
import LGTV from 'lgtv2'

function capabilities (backendControl: BackendControl): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
  return [
    Promise.resolve({
      type: 'AlexaInterface',
      interface: 'Alexa.PlaybackController',
      version: '3',
      supportedOperations: [
        'Play',
        'Pause',
        'Stop',
        'Rewind',
        'FastForward'
      ]
    })
  ]
}

function states (backendControl: BackendControl): Promise<ASH.ResponseContextProperty>[] {
  return []
}

async function genericHandler (alexaRequest: ASH.Request, backendControl: BackendControl, lgtvRequestURI: string): Promise<ASH.Response> {
  const lgtvRequest: LGTV.Request = {
    uri: lgtvRequestURI
  }
  await backendControl.lgtvCommand(lgtvRequest)
  return new ASH.Response({
    namespace: 'Alexa',
    name: 'Response',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  })
}

function handler (alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.PlaybackController') {
    throw ASH.errorResponseForWrongDirectiveNamespace(alexaRequest, 'Alexa.PlaybackController')
  }
  switch (alexaRequest.directive.header.name) {
    case 'Play':
      return genericHandler(alexaRequest, backendControl, 'ssap://media.controls/play')
    case 'Pause':
      return genericHandler(alexaRequest, backendControl, 'ssap://media.controls/pause')
    case 'Stop':
      return genericHandler(alexaRequest, backendControl, 'ssap://media.controls/stop')
    case 'Rewind':
      return genericHandler(alexaRequest, backendControl, 'ssap://media.controls/rewind')
    case 'FastForward':
      return genericHandler(alexaRequest, backendControl, 'ssap://media.controls/fastForward')
    default:
      throw ASH.errorResponseForInvalidDirectiveName(alexaRequest)
  }
}

export { capabilities, states, handler }
