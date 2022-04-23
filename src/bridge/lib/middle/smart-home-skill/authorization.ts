import * as Common from '../../../../common'
import { Backend } from '../../backend'

function capabilities (backend: Backend): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return []
}

function states (backend: Backend): Promise<Common.SHS.Context.Property>[] {
  return []
}

function handler (alexaRequest: Common.SHS.Request, backend: Backend): Common.SHS.Response {
  throw Common.SHS.Error.errorResponse(alexaRequest, null, 'INVALID_DIRECTIVE', '')
}

export { capabilities, states, handler }
