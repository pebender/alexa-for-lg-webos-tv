import { Request } from './request'
import { Response } from './response'

export function errorResponse (alexaRequest: Request | null, type: string, message: string): Response {
  if (alexaRequest !== null) {
    return new Response({
      namespace: 'Alexa',
      name: 'ErrorResponse',
      correlationToken: alexaRequest.getCorrelationToken(),
      endpointId: alexaRequest.getEndpointId(),
      payload: {
        type,
        message
      }
    })
  }
  return new Response({
    namespace: 'Alexa',
    name: 'ErrorResponse',
    payload: {
      type,
      message
    }
  })
}

export function errorResponseFromError (alexaRequest: Request, error: Error): Response {
  return errorResponse(
    alexaRequest,
    'INTERNAL_ERROR',
    error.toString()
  )
}

export function errorResponseForWrongNamespace (alexaRequest: Request, namespace: string): Response {
  return errorResponse(
    alexaRequest,
    'INTERNAL_ERROR',
    `You were sent to ${namespace} processing in error.`
  )
}

export function errorResponseForUnknownDirective (alexaRequest: Request): Response {
  return errorResponse(
    alexaRequest,
    'INTERNAL_ERROR',
    `I do not know the ${alexaRequest.directive.header.namespace} directive ${alexaRequest.directive.header.name}`
  )
}
