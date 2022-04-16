import * as ASH from '../../../common/alexa'

function handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  throw ASH.errorResponseForInvalidDirectiveNamespace(alexaRequest)
}

export { handler }
