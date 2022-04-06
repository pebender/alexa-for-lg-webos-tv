import * as ASH from '../../../common/alexa'
import { Bridge } from '../bridge-api'

function capabilities (): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
  return [ASH.Response.buildPayloadEndpointCapability({
    namespace: 'Alexa.EndpointHealth',
    propertyNames: ['connectivity']
  })]
}

function states (): Promise<ASH.ResponseContextProperty>[] {
  async function value (): Promise<'OK' | 'UNREACHABLE'> {
    try {
      const bridge = new Bridge('')
      await bridge.ping()
      return 'OK'
    } catch (_error) {
      return 'UNREACHABLE'
    }
  }

  const connectivityState = ASH.Response.buildContextProperty({
    namespace: 'Alexa.EndpointHealth',
    name: 'connectivity',
    value: value
  })
  return [connectivityState]
}

function handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.EndpointHealth') {
    return Promise.resolve(ASH.errorResponseForWrongNamespace(alexaRequest, alexaRequest.directive.header.namespace))
  }
  switch (alexaRequest.directive.header.name) {
    default:
      return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest))
  }
}

export { capabilities, states, handler }
