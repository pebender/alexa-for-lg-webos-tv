import * as Common from '../../../common'
import { BackendControl } from '../backend'

function capabilities (backendControl: BackendControl): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [Common.SHS.Response.buildPayloadEndpointCapability({
    namespace: 'Alexa'
  })]
}

function states (backendControl: BackendControl): Promise<Common.SHS.Context.Property>[] {
  return []
}

function reportStateHandler (alexaRequest: Common.SHS.Request, backendControl: BackendControl): Common.SHS.Response {
  return new Common.SHS.Response({
    namespace: 'Alexa',
    name: 'StateReport',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  })
}

function handler (alexaRequest: Common.SHS.Request, backendControl: BackendControl): Promise<Common.SHS.Response> {
  if (alexaRequest.directive.header.namespace !== 'Alexa') {
    throw Common.SHS.Error.errorResponse(
      alexaRequest,
      null,
      'INVALID_DIRECTIVE',
      `received namespace='${alexaRequest.directive.header.namespace}' expected namespace='Alexa'.`)
  }
  switch (alexaRequest.directive.header.name) {
    case 'ReportState':
      return Promise.resolve(reportStateHandler(alexaRequest, backendControl))
    default:
      throw Common.SHS.Error.errorResponse(
        alexaRequest, null,
        'INVALID_DIRECTIVE',
        `namespace='${alexaRequest.directive.header.namespace}' does not support name='${alexaRequest.directive.header.name}`)
  }
}

export { capabilities, states, handler }
