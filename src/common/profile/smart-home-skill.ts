import * as HTTPSRequest from '../https-request'
import * as ASHError from '../smart-home-skill/error'

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

export async function getUserProfile (bearerToken: string): Promise<{ user_id: string; email: string; [x: string]: string}> {
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname: 'api.amazon.com',
    port: 443,
    path: '/user/profile',
    method: 'GET',
    headers: {}
  }
  let response
  try {
    response = await HTTPSRequest.request(requestOptions, bearerToken)
  } catch (error) {
    const requestError = (error as HTTPSRequest.ResponseError)
    if (typeof responseErrorMessages[requestError.name] === 'string') {
      throw ASHError.errorResponse(
        null,
        requestError.http?.statusCode ? requestError.http?.statusCode : null,
        'INTERNAL_ERROR',
        responseErrorMessages[requestError.name])
    } else {
      throw ASHError.errorResponse(
        null,
        requestError.http?.statusCode ? requestError.http?.statusCode : null,
        'INTERNAL_ERROR',
        'Sorry. I could not retrieve your profile.')
    }
  }

  if (typeof response.user_id === 'undefined') {
    throw ASHError.errorResponse(
      null,
      null,
      'INTERNAL_ERROR',
      'Sorry. I could not retrieve your profile.')
  }
  if (typeof response.email === 'undefined') {
    throw ASHError.errorResponse(
      null,
      null,
      'INTERNAL_ERROR',
      'Sorry. I could not retrieve your profile.')
  }

  return (response as {user_id: string; email: string; [x: string]: string})
}

export async function getUserEmail (bearerToken: string): Promise<string> {
  const userProfile = await getUserProfile(bearerToken)
  return userProfile.email
}
