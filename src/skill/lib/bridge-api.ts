import * as ASH from '../../common/alexa'
import { constants } from '../../common/constants'
import { DynamoDB } from 'aws-sdk'
import http from 'http'
import https from 'https'

export interface BridgeRequest {
  [x: string]: number | string | object | undefined;
}

export interface BridgeResponse {
  error?: {
    name?: string;
    message?: string;
  };
  [x: string]: number | string | object | undefined;
}

async function getBridgeHostname (alexaRequest: ASH.Request): Promise<string | null> {
  const ashToken = alexaRequest.getBearerToken()
  if (ashToken === null) {
    throw Error()
  }
  const dynamoDBDocumentClient = new DynamoDB.DocumentClient({ region: 'us-east-1' })
  let hostname: string | null = null
  const ashTokenQueryParams = {
    TableName: `${constants.application.name.safe}`,
    IndexName: 'ashToken_index',
    KeyConditionExpression: '#ashToken = :ashToken_value',
    ExpressionAttributeNames: { '#ashToken': 'ashToken' },
    ExpressionAttributeValues: { ':ashToken_value': ashToken }
  }
  try {
    const data = await dynamoDBDocumentClient.query(ashTokenQueryParams).promise()
    console.log(data)
    if ((typeof data.Count !== 'undefined') && (typeof data.Items !== 'undefined')) {
      if (data.Count > 0) {
        console.log(`token result: ${JSON.stringify(data.Items[0])}`)
        if (typeof data.Items[0].hostname !== 'undefined') {
          hostname = data.Items[0].hostname
          console.log(`hostname: ${hostname}`)
          return hostname
        }
      }
      const email = await alexaRequest.getUserEmail()
      console.log(`email: ${email}`)
      const ashTokenUpdateParams = {
        TableName: `${constants.application.name.safe}`,
        Key: { email },
        UpdateExpression: 'set ashToken = :newAshToken',
        ExpressionAttributeValues: { ':newAshToken': ashToken }
      }
      console.log(`ashTokenUpdateParams: ${JSON.stringify(ashTokenUpdateParams)}`)
      try {
        await dynamoDBDocumentClient.update(ashTokenUpdateParams).promise()
      } catch (error) {
        let message: string = 'Unknown'
        if (error instanceof Error) {
          message = `${error.name} - ${error.message}`
        } else {
          if ('code' in (error as any)) {
            message = (error as any).code
          }
        }
        console.log(`Smart Home Skill Error: update ashToken: ${message}`)
        throw Error()
      }
    }
  } catch (error) {
    let message: string = 'Unknown'
    if (error instanceof Error) {
      message = `${error.name} - ${error.message} : ${JSON.stringify(error, null, 0)}`
    } else {
      if ('code' in (error as any)) {
        message = (error as any).code
      }
    }
    console.log(`Smart Home Skill Error: get hostname: ${message}`)
    throw Error()
  }

  try {
    const data = await dynamoDBDocumentClient.query(ashTokenQueryParams).promise()
    console.log(data)
    if ((typeof data.Count !== 'undefined') && (typeof data.Items !== 'undefined')) {
      if (data.Count > 0) {
        console.log(`token result: ${JSON.stringify(data.Items[0])}`)
        if (typeof data.Items[0].hostname !== 'undefined') {
          hostname = data.Items[0].hostname
          console.log(`hostname: ${hostname}`)
          return hostname
        }
      }
      throw Error()
    }
    throw Error()
  } catch (error) {
    let message: string = 'Unknown'
    if (error instanceof Error) {
      message = `${error.name} - ${error.message}`
    } else {
      if ('code' in (error as any)) {
        message = (error as any).code
      }
    }
    console.log(`Smart Home Skill Error: get hostname again: ${message}`)
    throw Error()
  }
}

async function sendHandler (requestOptions: {
  path: string;
}, alexaRequest: ASH.Request, requestBody: BridgeRequest): Promise<BridgeResponse> {
  let hostname: String | null = null
  try {
    hostname = await getBridgeHostname(alexaRequest)
  } catch (error) {
    console.log(`sendHandlerError: getBridgeHostname Error: ${JSON.stringify(error)}`)
  }
  if (hostname === null) {
    throw Error()
  }

  return new Promise((resolve, reject): void => {
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
      port: 25392,
      path: requestOptions.path,
      headers: {}
    }

    const content = JSON.stringify(requestBody)
    options.method = 'POST'
    const token = alexaRequest.getBearerToken()
    if (token === null) {
      throw Error()
    }
    options.headers.authorization = `Bearer ${token}`
    options.headers['content-type'] = 'application/json'
    options.headers['content-length'] = Buffer.byteLength(content).toString()
    const request = https.request(options)
    request.once('response', (response): void => {
      let body: BridgeResponse = {}
      let data = ''
      response.setEncoding('utf8')
      response.on('data', (chunk: string): void => {
        data += chunk
      })
      response.on('end', (): void => {
        // The expected HTTP/1.1 status code is 200.
        const statusCode = response.statusCode
        if (typeof statusCode === 'undefined') {
          const message = 'The bridge returned no HTTP/1.1 status code.'
          return reject(new Error(message))
        }
        if (statusCode !== 200) {
          if (typeof http.STATUS_CODES[statusCode] === 'undefined') {
            const message = 'The bridge returned HTTP/1.1 status code: ' +
                            `'${statusCode}'.`
            return reject(new Error(message))
          } else {
            const message = 'The bridge returned HTTP/1.1 status code: ' +
                            `'${statusCode}' ('${http.STATUS_CODES[statusCode]}').`
            return reject(new Error(message))
          }
        }
        // The expected HTTP/1.1 'content-type' header is 'application/json'
        const contentType = response.headers['content-type']
        if (typeof contentType === 'undefined') {
          const message = 'The bridge returned no \'content-type\' header.'
          return reject(new Error(message))
        }
        if (!(/^application\/json/).test(contentType.toLowerCase())) {
          const message = 'The bridge returned the wrong \'content-type\' header:' +
                          `'${contentType.toLowerCase()}'.`
          return reject(new Error(message))
        }
        // Validate the body.
        try {
          body = JSON.parse(data)
        } catch (error) {
          const message = 'The bridge returned invalid JSON in its body.'
          return reject(new Error(message))
        }
        if (typeof body.error !== 'undefined') {
          if (typeof body.error.name !== 'undefined') {
            const message = 'The bridge returned the error: ' +
                            `'${body.error.name}: ${body.error.message}'.`
            return reject(new Error(message))
          } else {
            const message = 'The bridge returned the error: ' +
                            `'${body.error.message}'.`
            return reject(new Error(message))
          }
        }
        // Return the body.
        return resolve(body)
      })
      response.on('error', (error: Error): void => {
        const message = 'There was a problem talking to the bridge. ' +
                        `The error was [${error.toString()}].`
        return reject(new Error(message))
      })
    })
    request.on('error', (error: Error): void => {
      const message = 'There was a problem talking to the bridge.' +
                      `The error was [${error.name}: ${error.message}].`
      return reject(new Error(message))
    })
    request.write(content)
    request.end()
  })
}

class Bridge {
  private _null: string
  public constructor (token: string | null) {
    this._null = ''
  }

  public static skillPath (): string {
    return `/${constants.application.name.safe}`
  }

  public async sendSkillDirective (request: ASH.Request): Promise<ASH.Response> {
    const options = {
      path: Bridge.skillPath()
    }
    try {
      const response = ((await sendHandler(options, request, request)) as ASH.Response)
      const alexaResponse = new ASH.Response(response)
      return alexaResponse
    } catch (error) {
      if (error instanceof Error) {
        return ASH.errorResponseFromError(request, error)
      } else {
        return ASH.errorResponse(request, 'Unknown', 'Unknown')
      }
    }
  }

  public send (
    sendOptions: {
      path: string;
    },
    alexaRequest: ASH.Request,
    request: BridgeRequest
  ): Promise<BridgeResponse> {
    return sendHandler(sendOptions, alexaRequest, request)
  }
}

export { Bridge }
