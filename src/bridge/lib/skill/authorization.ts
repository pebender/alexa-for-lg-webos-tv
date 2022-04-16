import * as ASH from '../../../common/alexa'
import { Backend } from '../backend'

function capabilities (backend: Backend): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
  return []
}

function states (backend: Backend): Promise<ASH.ResponseContextProperty>[] {
  return []
}

function handler (alexaRequest: ASH.Request, backend: Backend): ASH.Response {
  throw ASH.errorResponse(alexaRequest, null, 'INVALID_DIRECTIVE', '')
}

export { capabilities, states, handler }
