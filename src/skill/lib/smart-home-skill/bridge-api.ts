import * as HTTPSRequest from '../../../common/https-request'
import * as Database from '../database'
import * as ASH from '../../../common/smart-home-skill'
import { constants } from '../../../common/constants'
import * as Debug from '../../../common/debug'

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

async function getBridgeHostname (alexaRequest: ASH.AlexaRequest): Promise<string> {
  Debug.debug(`getBridgeHostname: alexaRequest: ${JSON.stringify(alexaRequest, null, 2)}`)

  async function queryBridgeHostname (ashToken: string): Promise<string | null> {
    let hostname
    try {
      hostname = await Database.getHostname(ashToken)
      if (hostname !== null) {
        return hostname
      } else {
        return null
      }
    } catch (error) {
      throw ASH.errorResponseFromError(alexaRequest, error)
    }
  }

  async function setASHToken (email: string, ashToken: string): Promise<void> {
    try {
      await Database.setASHToken(email, ashToken)
    } catch (error) {
      throw ASH.errorResponseFromError(alexaRequest, error)
    }
  }

  const ashToken = alexaRequest.getBearerToken()
  let hostname: string | null = null
  hostname = await queryBridgeHostname(ashToken)
  if (hostname !== null) {
    return hostname
  }
  const email = await alexaRequest.getUserEmail()
  await setASHToken(email, ashToken)
  hostname = await await queryBridgeHostname(ashToken)
  if (hostname !== null) {
    return hostname
  }

  throw ASH.errorResponse(
    alexaRequest,
    null,
    'BRIDGE_UNREACHABLE',
    'Bridge hostname has not been configured'
  )
}

async function sendHandler (path: string, alexaRequest: ASH.AlexaRequest, message: Request) : Promise<ASH.AlexaResponse> {
  const hostname = await getBridgeHostname(alexaRequest)
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname,
    path,
    port: constants.bridge.port.https,
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
        throw ASH.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge connect interrupted.')
      case 'STATUS_CODE_MISSING':
        throw ASH.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge response included no HTTP status code.')
      case 'INVALID_AUTHORIZATION_CREDENTIAL':
        throw ASH.errorResponse(
          null,
          null,
          'INVALID_AUTHORIZATION_CREDENTIAL', 'Failed to retrieve user profile.')
      case 'INTERNAL_ERROR':
        throw ASH.errorResponse(null, null, 'INTERNAL_ERROR', 'Failed to retrieve user profile.')
      case 'CONTENT_TYPE_MISSING':
        throw ASH.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge response did not return HTTP header \'content-type\'.')
      case 'CONTENT_TYPE_INCORRECT':
        throw ASH.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          `Bridge response included an incorrect HTTP header 'content-type' of '${requestError.http?.contentType?.toLocaleLowerCase()}'.`)
      case 'BODY_MISSING':
        throw ASH.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge did not return a body.')
      case 'BODY_INVALID_FORMAT':
        throw ASH.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge returned a malformed body.')
      case 'UNKNOWN_ERROR':
        throw ASH.errorResponseFromError(
          null,
          requestError.error)
      default:
        throw ASH.errorResponse(
          null,
          null,
          'INTERNAL_ERROR', 'error: unknown.')
    }
  }

  return (response as ASH.AlexaResponse)
}

export async function sendSkillDirective (request: ASH.AlexaRequest): Promise<ASH.AlexaResponse> {
  const outputStack = true
  const ashPath: string = `/${constants.bridge.path}`
  try {
    const response = await sendHandler(ashPath, request, request)
    if (response instanceof ASH.AlexaError) {
      if ((outputStack) && ('stack' in (response as any))) {
        Debug.debug((response as any).stack)
      }
      return response.response
    }
    return response
  } catch (error) {
    const response = ASH.errorResponseFromError(request, error)
    if ((outputStack) && ('stack' in (response as any))) {
      Debug.debug((response as any).stack)
    }
    return response.response
  }
}
