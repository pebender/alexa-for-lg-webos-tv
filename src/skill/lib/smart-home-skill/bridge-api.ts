import * as HTTPSRequest from '../../../common/https-request'
import * as Database from '../database'
import * as Common from '../../../common'

export interface Request {
  [x: string]: number | string | object | undefined;
}

export interface Response {
  error?: {
    name?: string;
    message?: string;
  };
  [x: string]: number | string | object | undefined;
}

async function getBridgeHostname (alexaRequest: Common.SHS.AlexaRequest): Promise<string> {
  Common.Debug.debug(`getBridgeHostname: alexaRequest: ${JSON.stringify(alexaRequest, null, 2)}`)

  async function queryBridgeHostname (bearerToken: string): Promise<string | null> {
    let hostname
    try {
      hostname = await Database.getHostname(bearerToken)
      if (hostname !== null) {
        return hostname
      } else {
        return null
      }
    } catch (error) {
      throw Common.SHS.errorResponseFromError(alexaRequest, error)
    }
  }

  async function setBearerToken (email: string, bearerToken: string): Promise<void> {
    try {
      await Database.setBearerToken(email, bearerToken)
    } catch (error) {
      throw Common.SHS.errorResponseFromError(alexaRequest, error)
    }
  }

  const bearerToken = alexaRequest.getBearerToken()
  let hostname: string | null = null
  hostname = await queryBridgeHostname(bearerToken)
  if (hostname !== null) {
    return hostname
  }
  const email = await alexaRequest.getUserEmail()
  await setBearerToken(email, bearerToken)
  hostname = await await queryBridgeHostname(bearerToken)
  if (hostname !== null) {
    return hostname
  }

  throw Common.SHS.errorResponse(
    alexaRequest,
    null,
    'BRIDGE_UNREACHABLE',
    'Bridge hostname has not been configured'
  )
}

async function sendHandler (path: string, alexaRequest: Common.SHS.AlexaRequest, message: Request) : Promise<Common.SHS.AlexaResponse> {
  const hostname = await getBridgeHostname(alexaRequest)
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname,
    path,
    port: Common.constants.bridge.port.https,
    method: 'POST',
    headers: {}
  }
  const bearerToken = alexaRequest.getBearerToken()

  let response
  try {
    response = await HTTPSRequest.request(requestOptions, bearerToken, alexaRequest)
  } catch (error) {
    const requestError = (error as HTTPSRequest.ResponseError)
    switch (requestError.name) {
      case 'CONNECTION_INTERRUPTED':
        throw Common.SHS.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge connect interrupted.')
      case 'STATUS_CODE_MISSING':
        throw Common.SHS.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge response included no HTTP status code.')
      case 'INVALID_AUTHORIZATION_CREDENTIAL':
        throw Common.SHS.errorResponse(
          null,
          null,
          'INVALID_AUTHORIZATION_CREDENTIAL', 'Failed to retrieve user profile.')
      case 'INTERNAL_ERROR':
        throw Common.SHS.errorResponse(null, null, 'INTERNAL_ERROR', 'Failed to retrieve user profile.')
      case 'CONTENT_TYPE_MISSING':
        throw Common.SHS.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge response did not return HTTP header \'content-type\'.')
      case 'CONTENT_TYPE_INCORRECT':
        throw Common.SHS.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          `Bridge response included an incorrect HTTP header 'content-type' of '${requestError.http?.contentType?.toLocaleLowerCase()}'.`)
      case 'BODY_MISSING':
        throw Common.SHS.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge did not return a body.')
      case 'BODY_INVALID_FORMAT':
        throw Common.SHS.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge returned a malformed body.')
      case 'UNKNOWN_ERROR':
        throw Common.SHS.errorResponseFromError(
          null,
          requestError.error)
      default:
        throw Common.SHS.errorResponse(
          null,
          null,
          'INTERNAL_ERROR', 'error: unknown.')
    }
  }

  return (response as Common.SHS.AlexaResponse)
}

export async function sendSkillDirective (request: Common.SHS.AlexaRequest): Promise<Common.SHS.AlexaResponse> {
  const outputStack = true
  const ashPath: string = `/${Common.constants.bridge.path}`
  try {
    const response = await sendHandler(ashPath, request, request)
    if (response instanceof Common.SHS.AlexaError) {
      if ((outputStack) && ('stack' in (response as any))) {
        Common.Debug.debug((response as any).stack)
      }
      return response.response
    }
    return response
  } catch (error) {
    const response = Common.SHS.errorResponseFromError(request, error)
    if ((outputStack) && ('stack' in (response as any))) {
      Common.Debug.debug((response as any).stack)
    }
    return response.response
  }
}
