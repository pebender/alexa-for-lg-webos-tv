import * as ASH from '../../../common/alexa'

function handler (alexaRequest: ASH.AlexaRequest): Promise<ASH.AlexaResponse> {
  throw ASH.errorResponseForInvalidDirectiveNamespace(alexaRequest)
}

export { handler }
