import * as ASH from '../../../common/alexa'
import { Backend } from '../backend'

function capabilities (backend: Backend): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
  return []
}

function states (backend: Backend): Promise<ASH.ResponseContextProperty>[] {
  return []
}

function handler (alexaRequest: ASH.Request, backend: Backend): ASH.Response {
  return ASH.errorResponse(alexaRequest, 'INTERNAL_ERROR', '')
}

export { capabilities, states, handler }
