import * as Common from '../../../common'
import { Backend } from '../backend'

function capabilities (backend: Backend): Promise<Common.SHS.AlexaResponseEventPayloadEndpointCapability>[] {
  return []
}

function states (backend: Backend): Promise<Common.SHS.AlexaResponseContextProperty>[] {
  return []
}

function handler (alexaRequest: Common.SHS.AlexaRequest, backend: Backend): Common.SHS.AlexaResponse {
  throw Common.SHS.errorResponse(alexaRequest, null, 'INVALID_DIRECTIVE', '')
}

export { capabilities, states, handler }
