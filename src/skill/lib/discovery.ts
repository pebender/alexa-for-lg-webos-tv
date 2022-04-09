import * as ASH from '../../common/alexa'
import { Bridge } from './bridge-api'

async function handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.Discovery') {
    return ASH.errorResponseForWrongNamespace(alexaRequest, alexaRequest.directive.header.namespace)
  }

  const bridge: Bridge = new Bridge('')

  let alexaResponse: ASH.Response | null = null

  try {
    alexaResponse = await bridge.sendSkillDirective(alexaRequest)
  } catch (error) {
    if (error instanceof Error) {
      alexaResponse = ASH.errorResponseFromError(alexaRequest, error)
    } else {
      alexaResponse = ASH.errorResponse(alexaRequest, 'Unknown', 'Unknown')
    }
  }

  return alexaResponse
}

export { handler }
