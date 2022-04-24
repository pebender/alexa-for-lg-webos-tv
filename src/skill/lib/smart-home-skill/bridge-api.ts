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

async function getBridgeInformation (alexaRequest: Common.SHS.Request): Promise<Database.BridgeInformation> {
  Common.Debug.debug('getBridgeInformation: alexaRequest:')
  Common.Debug.debugJSON(alexaRequest)

  async function queryBridgeInformation (skillToken: string): Promise<Database.BridgeInformation | null> {
    let bridgeInformation
    try {
      bridgeInformation = await Database.getBridgeInformation(skillToken)
      if (bridgeInformation !== null) {
        return bridgeInformation
      } else {
        return null
      }
    } catch (error) {
      throw Common.SHS.Error.errorResponseFromError(alexaRequest, error)
    }
  }

  async function setSkillToken (email: string, bearerToken: string): Promise<void> {
    try {
      await Database.setSkillToken(email, bearerToken)
    } catch (error) {
      throw Common.SHS.Error.errorResponseFromError(alexaRequest, error)
    }
  }

  const bearerToken = alexaRequest.getBearerToken()
  let bridgeInformation: Database.BridgeInformation | null = null
  bridgeInformation = await queryBridgeInformation(bearerToken)
  if (bridgeInformation !== null) {
    return bridgeInformation
  }
  const email = await alexaRequest.getUserEmail()
  await setSkillToken(email, bearerToken)
  bridgeInformation = await await queryBridgeInformation(bearerToken)
  if (bridgeInformation !== null) {
    return bridgeInformation
  }

  throw Common.SHS.Error.errorResponse(
    alexaRequest,
    null,
    'BRIDGE_UNREACHABLE',
    'Bridge has not been configured'
  )
}

async function sendHandler (path: string, alexaRequest: Common.SHS.Request, message: Request) : Promise<Common.SHS.Response> {
  const { hostname, bridgeToken } = await getBridgeInformation(alexaRequest)

  const requestOptions: Common.HTTPSRequest.RequestOptions = {
    hostname,
    path,
    port: Common.constants.bridge.port.https,
    method: 'POST',
    headers: {}
  }

  let response
  try {
    response = await Common.HTTPSRequest.request(requestOptions, bridgeToken, message)
  } catch (error) {
    const requestError = (error as Common.HTTPSRequest.ResponseError)
    switch (requestError.name) {
      case 'CONNECTION_INTERRUPTED':
        throw Common.SHS.Error.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge connect interrupted.')
      case 'STATUS_CODE_MISSING':
        throw Common.SHS.Error.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge response included no HTTP status code.')
      case 'INVALID_AUTHORIZATION_CREDENTIAL':
        throw Common.SHS.Error.errorResponse(
          null,
          null,
          'INVALID_AUTHORIZATION_CREDENTIAL', 'Failed to retrieve user profile.')
      case 'INTERNAL_ERROR':
        throw Common.SHS.Error.errorResponse(null, null, 'INTERNAL_ERROR', 'Failed to retrieve user profile.')
      case 'CONTENT_TYPE_MISSING':
        throw Common.SHS.Error.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge response did not return HTTP header \'content-type\'.')
      case 'CONTENT_TYPE_INCORRECT':
        throw Common.SHS.Error.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          `Bridge response included an incorrect HTTP header 'content-type' of '${requestError.http?.contentType?.toLocaleLowerCase()}'.`)
      case 'BODY_MISSING':
        throw Common.SHS.Error.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge did not return a body.')
      case 'BODY_INVALID_FORMAT':
        throw Common.SHS.Error.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Bridge returned a malformed body.')
      case 'UNKNOWN_ERROR':
        throw Common.SHS.Error.errorResponseFromError(
          null,
          requestError.error)
      default:
        throw Common.SHS.Error.errorResponse(
          null,
          null,
          'INTERNAL_ERROR', 'error: unknown.')
    }
  }

  return (response as Common.SHS.Response)
}

export async function sendSkillDirective (request: Common.SHS.Request): Promise<Common.SHS.Response> {
  const outputStack = true
  const shsPath: string = `${Common.constants.bridge.path.skill}`
  try {
    const response = await sendHandler(shsPath, request, request)
    if (response instanceof Common.SHS.Error) {
      if ((outputStack) && ('stack' in (response as any))) {
        Common.Debug.debug((response as any).stack)
      }
      return response.response
    }
    return response
  } catch (error) {
    const response = Common.SHS.Error.errorResponseFromError(request, error)
    if ((outputStack) && ('stack' in (response as any))) {
      Common.Debug.debug((response as any).stack)
    }
    return response.response
  }
}
