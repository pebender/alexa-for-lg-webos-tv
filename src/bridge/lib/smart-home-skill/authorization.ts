import * as ASH from '../../../common/smart-home-skill'
import { Backend } from '../backend'

function capabilities (backend: Backend): Promise<ASH.AlexaResponseEventPayloadEndpointCapability>[] {
  return []
}

function states (backend: Backend): Promise<ASH.AlexaResponseContextProperty>[] {
  return []
}

function handler (alexaRequest: ASH.AlexaRequest, backend: Backend): ASH.AlexaResponse {
  throw ASH.errorResponse(alexaRequest, null, 'INVALID_DIRECTIVE', '')
}

export { capabilities, states, handler }
