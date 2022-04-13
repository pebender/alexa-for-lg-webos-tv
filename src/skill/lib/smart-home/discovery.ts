import * as ASH from '../../../common/alexa'
import * as Bridge from '../bridge-api'

async function handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.Discovery') {
    return ASH.errorResponseForWrongNamespace(alexaRequest, alexaRequest.directive.header.namespace)
  }

  let alexaResponse: ASH.Response | null = null

  try {
    alexaResponse = await Bridge.sendSkillDirective(alexaRequest)
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
