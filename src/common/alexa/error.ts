import { AlexaRequest } from './request'
import { AlexaResponse } from './response'

export class AlexaError {
  public response: AlexaResponse
  public httpStatusCode?: number
  public stack?: string

  constructor (request: any, httpStatusCode: number | null, type: string, message: string) {
    if (httpStatusCode !== null) {
      this.httpStatusCode = httpStatusCode
    }
    if (request !== null) {
      this.response = new AlexaResponse({
        namespace: 'Alexa',
        name: 'ErrorResponse',
        endpointId: request.getEndpointId(),
        payload: {
          type,
          message
        }
      })
    } else {
      this.response = new AlexaResponse({
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

export function errorResponse (request: AlexaRequest | null, httpStatusCode: number | null, type: string, message: string): AlexaError {
  return new AlexaError(request, httpStatusCode, type, message)
}

export function errorResponseFromError (alexaRequest: AlexaRequest | null, error: any): AlexaError {
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
  return new AlexaError(
    alexaRequest,
    500,
    'INTERNAL_ERROR',
    `${message} (${name})`
  )
}

export function errorResponseForWrongDirectiveNamespace (alexaRequest: AlexaRequest, namespace: string): AlexaError {
  return new AlexaError(
    alexaRequest,
    400,
    'INVALID_DIRECTIVE',
    `expected namespace='${namespace}' but directive has namespace='${alexaRequest.directive.header.namespace}.`
  )
}

export function errorResponseForInvalidDirectiveNamespace (alexaRequest: AlexaRequest): AlexaError {
  return new AlexaError(
    alexaRequest,
    400,
    'INVALID_DIRECTIVE',
    `unknown namespace='${alexaRequest.directive.header.namespace}'.`
  )
}

export function errorResponseForInvalidDirectiveName (alexaRequest: AlexaRequest): AlexaError {
  return new AlexaError(
    alexaRequest,
    400,
    'INVALID_DIRECTIVE',
    `namespace='${alexaRequest.directive.header.namespace}' does not support name='${alexaRequest.directive.header.name}'.`
  )
}

export function errorResponseForInvalidValue (alexaRequest: AlexaRequest, parameter: string): AlexaError {
  return new AlexaError(
    alexaRequest,
    400,
    'INVALID_VALUE',
    `namespace=${alexaRequest.directive.header.namespace},name=${alexaRequest.directive.header.name}',parameter='${parameter}' has an invalid value.`
  )
}
