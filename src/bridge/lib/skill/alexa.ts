import * as ASH from '../../../common/alexa'
import { BackendControl } from '../backend'

function capabilities (backendControl: BackendControl): Promise<ASH.AlexaResponseEventPayloadEndpointCapability>[] {
  return [ASH.AlexaResponse.buildPayloadEndpointCapability({
    namespace: 'Alexa'
  })]
}

function states (backendControl: BackendControl): Promise<ASH.AlexaResponseContextProperty>[] {
  return []
}

function reportStateHandler (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): ASH.AlexaResponse {
  return new ASH.AlexaResponse({
    namespace: 'Alexa.',
    name: 'StateReport',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  })
}

function handler (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): Promise<ASH.AlexaResponse> {
  if (alexaRequest.directive.header.namespace !== 'Alexa') {
    throw ASH.errorResponse(
      alexaRequest,
      null,
      'INVALID_DIRECTIVE',
      `received namespace='${alexaRequest.directive.header.namespace}' expected namespace='Alexa'.`)
  }
  switch (alexaRequest.directive.header.name) {
    case 'ReportState':
      return Promise.resolve(reportStateHandler(alexaRequest, backendControl))
    default:
      throw ASH.errorResponse(
        alexaRequest, null,
        'INVALID_DIRECTIVE',
        `namespace='${alexaRequest.directive.header.namespace}' does not support name='${alexaRequest.directive.header.name}`)
  }
}

export { capabilities, states, handler }
