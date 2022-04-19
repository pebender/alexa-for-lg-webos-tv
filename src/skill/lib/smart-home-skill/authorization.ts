import * as ASH from '../../../common/smart-home-skill'

function handler (alexaRequest: ASH.AlexaRequest): Promise<ASH.AlexaResponse> {
  throw ASH.errorResponseForInvalidDirectiveNamespace(alexaRequest)
}

export { handler }
