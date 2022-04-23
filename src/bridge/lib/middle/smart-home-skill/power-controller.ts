import * as Common from '../../../../common'
import { BackendControl } from '../../backend'

function capabilities (backendControl: BackendControl): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [Common.SHS.Response.buildPayloadEndpointCapability({
    namespace: 'Alexa.PowerController',
    propertyNames: ['powerState']
  })]
}

function states (backendControl: BackendControl): Promise<Common.SHS.Context.Property>[] {
  function value (): 'ON' | 'OFF' {
    return backendControl.getPowerState()
  }

  const powerStateState = Common.SHS.Response.buildContextProperty({
    namespace: 'Alexa.PowerController',
    name: 'powerState',
    value
  })
  return [powerStateState]
}

async function turnOffHandler (alexaRequest: Common.SHS.Request, backendControl: BackendControl): Promise<Common.SHS.Response> {
  const poweredOff = await backendControl.turnOff()
  if (poweredOff === false) {
    throw Common.SHS.Error.errorResponse(
      alexaRequest,
      500,
      'INTERNAL_ERROR',
      `Alexa.PowerController.turnOff for LGTV ${backendControl.tv.udn} failed.`)
  }
  return new Common.SHS.Response({
    namespace: 'Alexa',
    name: 'Response',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  })
}

async function turnOnHandler (alexaRequest: Common.SHS.Request, backendControl: BackendControl): Promise<Common.SHS.Response> {
  const poweredOn = await backendControl.turnOn()
  if (poweredOn === false) {
    throw Common.SHS.Error.errorResponse(
      alexaRequest,
      500,
      'INTERNAL_ERROR',
      `Alexa.PowerController.turnOn for LGTV ${backendControl.tv.udn} failed.`)
  }
  return new Common.SHS.Response({
    namespace: 'Alexa',
    name: 'Response',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  })
}

function handler (alexaRequest: Common.SHS.Request, backendControl: BackendControl): Promise<Common.SHS.Response> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.PowerController') {
    throw Common.SHS.Error.errorResponseForWrongDirectiveNamespace(alexaRequest, 'Alexa.PowerController')
  }
  switch (alexaRequest.directive.header.name) {
    case 'TurnOff':
      return turnOffHandler(alexaRequest, backendControl)
    case 'TurnOn':
      return turnOnHandler(alexaRequest, backendControl)
    default:
      throw Common.SHS.Error.errorResponseForInvalidDirectiveName(alexaRequest)
  }
}

export { capabilities, states, handler }
