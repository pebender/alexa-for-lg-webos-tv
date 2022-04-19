import * as Common from '../../../common'

function handler (alexaRequest: Common.SHS.AlexaRequest): Promise<Common.SHS.AlexaResponse> {
  throw Common.SHS.errorResponseForInvalidDirectiveNamespace(alexaRequest)
}

export { handler }
