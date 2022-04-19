import * as HTTPSRequest from '../https-request'

export async function getUserEmail (bearerToken: string): Promise<string> {
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname: 'api.amazonalexa.com',
    port: 443,
    path: '/v2/accounts/~current/settings/Profile.email',
    method: 'GET',
    headers: {}
  }
  let response
  try {
    response = await HTTPSRequest.request(requestOptions, bearerToken)
  } catch (error) {
    const requestError = (error as HTTPSRequest.ResponseError)
    switch (requestError.name) {
      case 'CONNECTION_INTERRUPTED':
        throw new Error('getUserEmail: error: Amazon Alexa profile server connection interrupted.')
      case 'STATUS_CODE_MISSING':
        throw new Error('getUserEmail: error: Amazon Alexa profile server response included no HTTP status code.')
      case 'INVALID_AUTHORIZATION_CREDENTIAL':
        throw new Error('getUserEmail: error: Amazon Alexa profile rejected with INVALID_AUTHORIZATION_CREDENTIAL')
      case 'INTERNAL_ERROR':
        throw new Error('getUserEmail: error: Amazon Alexa profile rejected with INTERNAL_ERROR')
      case 'CONTENT_TYPE_MISSING':
        throw new Error('getUserEmail: error: Amazon Alexa profile server response included no HTTP header \'content-type\'.')
      case 'CONTENT_TYPE_INCORRECT':
        throw new Error(`getUserEmail: error: Amazon Alexa profile server response included an incorrect HTTP header 'content-type' of '${requestError.http?.contentType?.toLocaleLowerCase()}'.`)
      case 'BODY_MISSING':
        throw new Error('getUserEmail: error: Amazon Alexa profile server response did not include a body.')
      case 'BODY_INVALID_FORMAT':
        throw new Error('getUserEmail: error: Amazon Alexa profile server response a malformed body.')
      case 'UNKNOWN_ERROR': {
        const message = (requestError.error?.message as string)
        const name = (requestError.error?.name as string)
        throw new Error(`getUserEmail: error: ${message} (${name}).`)
      }
      default:
        throw new Error('getUserEmail: error: unknown.')
    }
  }
  return (response as string)
}
