import { Request } from './request'
import { Response, ResponseCapsule } from './response'

export class AlexaError implements ResponseCapsule {
  public httpStatusCode?: number
  public response: Response

  constructor (request: any, httpStatusCode: number | null, type: string, message: string) {
    if (httpStatusCode !== null) {
      this.httpStatusCode = httpStatusCode
    }
    if (request !== null) {
      this.response = new Response({
        namespace: 'Alexa',
        name: 'ErrorResponse',
        endpointId: request.getEndpointId(),
        payload: {
          type,
          message
        }
      })
    } else {
      this.response = new Response({
        namespace: 'Alexa',
        name: 'ErrorResponse',
        payload: {
          type,
          message
        }
      })
    }
    Error.captureStackTrace(this)
  }
}

export function errorResponse (request: Request | null, httpStatusCode: number | null, type: string, message: string): AlexaError {
  return new AlexaError(request, httpStatusCode, type, message)
}

export function errorResponseFromError (alexaRequest: Request | null, error: any): AlexaError {
  let message: string = 'unknown'
  let name: string = 'unknown'
  if ('message' in error) {
    message = error.message
  }
  if ('name' in error) {
    name = error.name
  }
  if ('code' in error) {
    name = error.code
  }
  return errorResponse(
    alexaRequest,
    500,
    'INTERNAL_ERROR',
    `${message} (${name})`
  )
}

export function errorResponseForWrongDirectiveNamespace (alexaRequest: Request, namespace: string): AlexaError {
  return errorResponse(
    alexaRequest,
    400,
    'INVALID_DIRECTIVE',
    `expected namespace='${namespace}' but directive has namespace='${alexaRequest.directive.header.namespace}.`
  )
}

export function errorResponseForInvalidDirectiveNamespace (alexaRequest: Request): AlexaError {
  return errorResponse(
    alexaRequest,
    400,
    'INVALID_DIRECTIVE',
    `unknown namespace='${alexaRequest.directive.header.namespace}'.`
  )
}

export function errorResponseForInvalidDirectiveName (alexaRequest: Request): AlexaError {
  return errorResponse(
    alexaRequest,
    400,
    'INVALID_DIRECTIVE',
    `namespace='${alexaRequest.directive.header.namespace}' does not support name='${alexaRequest.directive.header.name}'.`
  )
}

export function errorResponseForInvalidValue (alexaRequest: Request, parameter: string): AlexaError {
  return errorResponse(
    alexaRequest,
    400,
    'INVALID_VALUE',
    `namespace=${alexaRequest.directive.header.namespace},name=${alexaRequest.directive.header.name}',parameter='${parameter}' has an invalid value.`
  )
}
