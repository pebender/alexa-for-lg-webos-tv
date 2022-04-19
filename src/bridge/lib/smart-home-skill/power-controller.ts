import * as ASH from '../../../common/smart-home-skill'
import { BackendControl } from '../backend'

function capabilities (backendControl: BackendControl): Promise<ASH.AlexaResponseEventPayloadEndpointCapability>[] {
  return [ASH.AlexaResponse.buildPayloadEndpointCapability({
    namespace: 'Alexa.PowerController',
    propertyNames: ['powerState']
  })]
}

function states (backendControl: BackendControl): Promise<ASH.AlexaResponseContextProperty>[] {
  function value (): 'ON' | 'OFF' {
    return backendControl.getPowerState()
  }

  const powerStateState = ASH.AlexaResponse.buildContextProperty({
    namespace: 'Alexa.PowerController',
    name: 'powerState',
    value
  })
  return [powerStateState]
}

async function turnOffHandler (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): Promise<ASH.AlexaResponse> {
  const poweredOff = await backendControl.turnOff()
  if (poweredOff === false) {
    throw ASH.errorResponse(
      alexaRequest,
      500,
      'INTERNAL_ERROR',
      `Alexa.PowerController.turnOff for LGTV ${backendControl.tv.udn} failed.`)
  }
  return new ASH.AlexaResponse({
    namespace: 'Alexa',
    name: 'Response',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  })
}

async function turnOnHandler (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): Promise<ASH.AlexaResponse> {
  const poweredOn = await backendControl.turnOn()
  if (poweredOn === false) {
    throw ASH.errorResponse(
      alexaRequest,
      500,
      'INTERNAL_ERROR',
      `Alexa.PowerController.turnOn for LGTV ${backendControl.tv.udn} failed.`)
  }
  return new ASH.AlexaResponse({
    namespace: 'Alexa',
    name: 'Response',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  })
}

function handler (alexaRequest: ASH.AlexaRequest, backendControl: BackendControl): Promise<ASH.AlexaResponse> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.PowerController') {
    throw ASH.errorResponseForWrongDirectiveNamespace(alexaRequest, 'Alexa.PowerController')
  }
  switch (alexaRequest.directive.header.name) {
    case 'TurnOff':
      return turnOffHandler(alexaRequest, backendControl)
    case 'TurnOn':
      return turnOnHandler(alexaRequest, backendControl)
    default:
      throw ASH.errorResponseForInvalidDirectiveName(alexaRequest)
  }
}

export { capabilities, states, handler }
