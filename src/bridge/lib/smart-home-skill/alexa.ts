import * as Common from '../../../common'
import { BackendControl } from '../backend'

function capabilities (backendControl: BackendControl): Promise<Common.SHS.AlexaResponseEventPayloadEndpointCapability>[] {
  return [Common.SHS.AlexaResponse.buildPayloadEndpointCapability({
    namespace: 'Alexa'
  })]
}

function states (backendControl: BackendControl): Promise<Common.SHS.AlexaResponseContextProperty>[] {
  return []
}

function reportStateHandler (alexaRequest: Common.SHS.AlexaRequest, backendControl: BackendControl): Common.SHS.AlexaResponse {
  return new Common.SHS.AlexaResponse({
    namespace: 'Alexa.',
    name: 'StateReport',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  })
}

function handler (alexaRequest: Common.SHS.AlexaRequest, backendControl: BackendControl): Promise<Common.SHS.AlexaResponse> {
  if (alexaRequest.directive.header.namespace !== 'Alexa') {
    throw Common.SHS.errorResponse(
      alexaRequest,
      null,
      'INVALID_DIRECTIVE',
      `received namespace='${alexaRequest.directive.header.namespace}' expected namespace='Alexa'.`)
  }
  switch (alexaRequest.directive.header.name) {
    case 'ReportState':
      return Promise.resolve(reportStateHandler(alexaRequest, backendControl))
    default:
      throw Common.SHS.errorResponse(
        alexaRequest, null,
        'INVALID_DIRECTIVE',
        `namespace='${alexaRequest.directive.header.namespace}' does not support name='${alexaRequest.directive.header.name}`)
  }
}

export { capabilities, states, handler }
