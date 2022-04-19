import * as HTTPSRequest from '../https-request'
import * as ASHError from '../smart-home-skill/error'

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
    switch (requestError.name) {
      case 'CONNECTION_INTERRUPTED':
        throw ASHError.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Profile server connect interrupted.')
      case 'STATUS_CODE_MISSING':
        throw ASHError.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Profile server response included no HTTP status code.')
      case 'INVALID_AUTHORIZATION_CREDENTIAL':
        throw ASHError.errorResponse(
          null,
          null,
          'INVALID_AUTHORIZATION_CREDENTIAL', 'Failed to retrieve user profile.')
      case 'INTERNAL_ERROR':
        throw ASHError.errorResponse(null, null, 'INTERNAL_ERROR', 'Failed to retrieve user profile.')
      case 'CONTENT_TYPE_MISSING':
        throw ASHError.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Profile server response did not return HTTP header \'content-type\'.')
      case 'CONTENT_TYPE_INCORRECT':
        throw ASHError.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          `Profile server response included an incorrect HTTP header 'content-type' of '${requestError.http?.contentType?.toLocaleLowerCase()}'.`)
      case 'BODY_MISSING':
        throw ASHError.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Profile server did not return a body.')
      case 'BODY_INVALID_FORMAT':
        throw ASHError.errorResponse(
          null,
          null,
          'INTERNAL_ERROR',
          'Profile server returned a malformed body.')
      case 'UNKNOWN_ERROR':
        throw ASHError.errorResponseFromError(
          null,
          requestError.error)
      default:
        throw ASHError.errorResponse(
          null,
          null,
          'INTERNAL_ERROR', 'error: unknown.')
    }
  }

  if (typeof response.user_id === 'undefined') {
    throw ASHError.errorResponse(
      null,
      null,
      'INTERNAL_ERROR',
      'Profile server did not return \'user_id\'.')
  }
  if (typeof response.email === 'undefined') {
    throw ASHError.errorResponse(
      null,
      null,
      'INTERNAL_ERROR',
      'Profile server did not return \'email\'.')
  }

  return response
}

export async function getUserEmail (bearerToken: string): Promise<string> {
  const userProfile = await getUserProfile(bearerToken)
  return userProfile.email
}
