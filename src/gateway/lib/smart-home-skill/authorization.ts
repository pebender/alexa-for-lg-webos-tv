import * as ASH from '../../../common/alexa'
import { Backend } from '../backend'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities (backend: Backend): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
  return []
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states (backend: Backend): Promise<ASH.ResponseContextProperty>[] {
  return []
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler (alexaRequest: ASH.Request, backend: Backend): ASH.Response {
  return ASH.errorResponse(alexaRequest, 'INTERNAL_ERROR', '')
}

export { capabilities, states, handler }
