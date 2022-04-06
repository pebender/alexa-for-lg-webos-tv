import * as ASH from '../../../common/alexa'
import { Bridge } from '../bridge-api'
import { capabilities as alexaSmartHomeCapabilities } from './index'

async function bridgeEndpoint (): Promise<ASH.ResponseEventPayloadEndpoint | null> {
  try {
    let capabilities: ASH.ResponseEventPayloadEndpointCapability[] = []
    try {
      // Determine capabilities in parallel.
      capabilities = await Promise.all(alexaSmartHomeCapabilities())
    } catch (error) {
      capabilities = []
    }
    if (capabilities.length === 0) {
      return null
    }
    const endpoint: ASH.ResponseEventPayloadEndpoint = {
      endpointId: 'lg-webos-tv-bridge',
      friendlyName: 'For LG webOS TV',
      description: 'A bridge between the Alexa skill and the LG webOS TV',
      manufacturerName: 'Paul Bender',
      displayCategories: ['OTHER'],
      capabilities: []
    }
    capabilities.forEach((capability): void => {
      if (typeof capability === 'undefined' || capability === null) {
        return
      }
      endpoint.capabilities.push(capability)
    })
    return endpoint
  } catch (_error) {
    return null
  }
}

async function handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.Discovery') {
    return ASH.errorResponseForWrongNamespace(alexaRequest, alexaRequest.directive.header.namespace)
  }

  const bridge: Bridge = new Bridge('')

  let alexaResponse: ASH.Response | null = null
  let lgtvBridgeEndpoint: ASH.ResponseEventPayloadEndpoint | null = null

  try {
    alexaResponse = await bridge.sendSkillDirective(alexaRequest)
  } catch (error) {
    if (error instanceof Error) {
      alexaResponse = ASH.errorResponseFromError(alexaRequest, error)
    } else {
      alexaResponse = ASH.errorResponse(alexaRequest, 'Unknown', 'Unknown')
    }
  }

  try {
    lgtvBridgeEndpoint = await bridgeEndpoint()
  } catch (error) {
    lgtvBridgeEndpoint = null
  }

  if (lgtvBridgeEndpoint === null) {
    return alexaResponse
  }

  if (alexaResponse.event.header.namespace !== 'Alexa.Discovery' ||
        alexaResponse.event.header.name !== 'Discover.Response') {
    alexaResponse = new ASH.Response({
      namespace: 'Alexa.Discovery',
      name: 'Discover.Response'
    })
  }

  try {
    await alexaResponse.addPayloadEndpoint(lgtvBridgeEndpoint)
  } catch (error) {
    if (error instanceof Error) {
      return ASH.errorResponseFromError(alexaRequest, error)
    } else {
      return ASH.errorResponse(alexaRequest, 'Unknown', 'Unknown')
    }
  }

  return alexaResponse
}

export { handler }
