import * as Database from './database'
import * as ASH from '../../common/alexa'
import { constants } from '../../common/constants'
import * as Debug from '../../common/debug'
import https from 'https'

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

  const response: ASH.AlexaResponse = await new Promise((resolve, reject): void => {
    const options: {
      method?: 'POST';
      hostname: string;
      port: number;
      path: string;
      headers: {
        [x: string]: string;
      };
    } = {
      hostname: (hostname as string),
      port: constants.bridge.port.https,
      path,
      headers: {}
    }

    const content = JSON.stringify(message)
    options.method = 'POST'
    const token = alexaRequest.getBearerToken()
    options.headers.authorization = `Bearer ${token}`
    options.headers['content-type'] = 'application/json'
    options.headers['content-length'] = Buffer.byteLength(content).toString()
    const req = https.request(options, (res): void => {
      let body: Response
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chunk: string): void => {
        data += chunk
      })
      res.on('end', (): void => {
        // The expected HTTP/1.1 status code is 200.
        const statusCode = res.statusCode
        if (typeof statusCode === 'undefined') {
          reject(ASH.errorResponse(
            alexaRequest,
            null,
            'INTERNAL_ERROR',
            'Bridge response did not return an HTTP StatusCode.'
          ))
        }
        // The expected HTTP/1.1 'content-type' header is 'application/json'
        const contentType = res.headers['content-type']
        if (typeof contentType === 'undefined') {
          reject(ASH.errorResponse(
            alexaRequest,
            null,
            'INTERNAL_ERROR',
            'Bridge response did not return HTTP header \'content-type\'.'))
        }
        if (!(/^application\/json/).test((contentType as string).toLowerCase())) {
          reject(ASH.errorResponse(
            alexaRequest,
            null,
            'INTERNAL_ERROR',
            `Bridge response included an incorrect HTTP header 'content-type' of '${contentType?.toLocaleLowerCase()}'.`))
        }
        // Validate the body.
        try {
          body = JSON.parse(data)
        } catch (error) {
          reject(ASH.errorResponseFromError(alexaRequest, error))
        }
        // Return the body.
        resolve((body as ASH.AlexaResponse))
      })
    })
    req.on('error', (error: Error): void => {
      reject(ASH.errorResponse(
        alexaRequest,
        null,
        'INTERNAL_ERROR',
        `${error.message} (${error.name})'.`).response)
    })
    req.write(content)
    req.end()
  })

  return response
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
