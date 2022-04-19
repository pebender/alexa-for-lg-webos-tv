import * as HTTPSRequest from '../https-request'

const responseErrorMessages = {
  CONNECTION_INTERRUPTED: 'Sorry. I could not retrieve your profile. The connection to the server was interrupted.',
  STATUS_CODE_MISSING: 'Sorry, I could not retrieve your profile. The response from the server was invalid.',
  INVALID_AUTHORIZATION_CREDENTIAL: 'Sorry, I could not retrieve your profile. The server did not recognize the user',
  INTERNAL_ERROR: 'Sorry, I could not retrieve your profile.',
  CONTENT_TYPE_MISSING: 'Sorry, I could not retrieve your profile. The response from the server was invalid.',
  CONTENT_TYPE_INCORRECT: 'Sorry, I could not retrieve your profile. The response from the server was invalid.',
  BODY_MISSING: 'Sorry, I could not retrieve your profile. The response from the server was invalid.',
  BODY_INVALID_FORMAT: 'Sorry, I could not retrieve your profile. The response from the server was invalid.',
  UNKNOWN_ERROR: 'Sorry, I could not retrieve your profile.'
}

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
    if (typeof responseErrorMessages[requestError.name] === 'string') {
      throw new Error(responseErrorMessages[requestError.name])
    } else {
      throw new Error('Sorry. I could not retrieve your profile.')
    }
  }
  return (response as string)
}
