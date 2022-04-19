import * as ASHError from './smart-home-skill/error'
import https from 'https'

export async function getUserProfile (bearerToken: string): Promise<{ user_id: string; email: string; [x: string]: string}> {
  const options = {
    method: 'GET',
    hostname: 'api.amazon.com',
    path: '/user/profile',
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  }

  try {
    return await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          if (!res.complete) {
            reject(ASHError.errorResponse(
              null,
              null,
              'INTERNAL_ERROR',
              'Profile server connection was interrupted.'
            ))
          }
          const statusCode = res.statusCode
          if (typeof statusCode === 'undefined') {
            reject(ASHError.errorResponse(
              null,
              null,
              'INTERNAL_ERROR',
              'Bridge response did not return an HTTP StatusCode.'
            ))
          }
          switch (statusCode) {
            case 401:
              reject(ASHError.errorResponse(null, null, 'INVALID_AUTHORIZATION_CREDENTIAL', 'Failed to retrieve user profile.'))
              break
            case 403:
              reject(ASHError.errorResponse(null, null, 'INVALID_AUTHORIZATION_CREDENTIAL', 'Failed to retrieve user profile.'))
              break
            case 500:
              reject(ASHError.errorResponse(null, null, 'INTERNAL_ERROR', 'Failed to retrieve user profile.'))
              break
          }
          const contentType = res.headers['content-type']
          if (typeof contentType === 'undefined') {
            reject(ASHError.errorResponse(
              null,
              null,
              'INTERNAL_ERROR',
              'Profile server response did not return HTTP header \'content-type\'.').response)
          }
          if (!(/^application\/json/).test((contentType as string).toLowerCase())) {
            reject(ASHError.errorResponse(
              null,
              null,
              'INTERNAL_ERROR',
                `Profile server response included an incorrect HTTP header 'content-type' of '${contentType?.toLocaleLowerCase()}'.`))
          }
          // Validate the body.
          try {
            body = JSON.parse(data)
            if (typeof body.user_id === 'undefined') {
              reject(ASHError.errorResponse(null, null, 'INTERNAL_ERROR', 'Profile server did not return \'user_id\'.'))
            }
            if (typeof body.email === 'undefined') {
              reject(ASHError.errorResponse(null, null, 'INTERNAL_ERROR', 'Profile server did not return \'email\'.'))
            }
            resolve(body)
          } catch (error) {
            reject(ASHError.errorResponseFromError(null, error))
          }
        })

        res.on('error', (error: Error): void => {
          reject(ASHError.errorResponseFromError(null, error))
        })
      })
      req.on('error', (error: Error): void => {
        const message = 'There was a problem talking to the bridge.' +
                          `The error was [${error.name}: ${error.message}].`
        return reject(new Error(message))
      })
      req.end()
    })
  } catch (error) {
    throw ASHError.errorResponseFromError(null, error)
  }
}

export async function getUserEmail (bearerToken: string): Promise<string> {
  const userProfile = await getUserProfile(bearerToken)
  return userProfile.email
}
