import * as ASH from '../../common/alexa'
import { constants } from '../../common/constants'
import { DynamoDB } from 'aws-sdk'
import http from 'http'
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

async function getBridgeHostname (alexaRequest: ASH.Request): Promise<string | null> {
  console.log(`getBridgeHostname: alexaRequest: ${JSON.stringify(alexaRequest, null, 2)}`)
  const ashToken = alexaRequest.getBearerToken()
  if (ashToken === null) {
    throw Error('bearer token not found')
  }

  let hostname: string | null = null

  const dynamoDBDocumentClient = new DynamoDB.DocumentClient({ region: constants.aws.region })

  async function queryBridgeHostname (dynamoDBDocumentClient: DynamoDB.DocumentClient, ashToken: string): Promise<string | null> {
    const ashTokenQueryParams = {
      TableName: constants.aws.dynamoDB.tableName,
      IndexName: constants.aws.dynamoDB.indexName,
      KeyConditionExpression: '#ashToken = :ashToken_value',
      ExpressionAttributeNames: { '#ashToken': 'ashToken' },
      ExpressionAttributeValues: { ':ashToken_value': ashToken }
    }
    console.log(`getBridgeHostname: queryBridgeHostname: Params: ${JSON.stringify(ashTokenQueryParams)}`)
    let data
    try {
      data = await dynamoDBDocumentClient.query(ashTokenQueryParams).promise()
    } catch (error) {
      let message: string = 'Unknown'
      if (error instanceof Error) {
        message = `${error.name} - ${error.message} : ${JSON.stringify(error, null, 0)}`
      } else {
        if ('code' in (error as any)) {
          message = (error as any).code
        }
      }
      console.log(`getBridgeHostname: queryBridgeHostname: Error: ${message}`)
      throw Error()
    }
    console.log(`getBridgeHostname ashToken Query result: ${JSON.stringify(data)}`)
    if ((typeof data.Count !== 'undefined') && (data.Count > 0) &&
        (typeof data.Items !== 'undefined') && typeof data.Items[0].hostname !== 'undefined') {
      hostname = data.Items[0].hostname
      console.log(`getBridgeHostname: queryBridgeHostname: hostname: ${hostname}`)
      return hostname
    }

    return null
  }

  async function setASHToken (dynamoDBDocumentClient: DynamoDB.DocumentClient, ashToken: string): Promise<void> {
    let email: string | null = null
    try {
      email = await alexaRequest.getUserEmail()
    } catch (error) {
      let message: string = 'Unknown'
      if (error instanceof Error) {
        message = `${error.name} - ${error.message} : ${JSON.stringify(error, null, 0)}`
      } else {
        if ('code' in (error as any)) {
          message = (error as any).code
        }
      }
      console.log(`getBridgeHostname: setASHToken: Error: getUserEMail: ${message}`)
      throw Error()
    }
    if (email === null) {
      throw Error()
    }
    console.log(`getBridgeHostname: setASHToken: email: ${email}`)
    const ashTokenUpdateParams = {
      TableName: constants.aws.dynamoDB.tableName,
      Key: { email },
      UpdateExpression: 'set ashToken = :newAshToken',
      ExpressionAttributeValues: { ':newAshToken': ashToken }
    }
    console.log(`getBridgeHostname: setASHToken: Params: ${JSON.stringify(ashTokenUpdateParams)}`)
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
      console.log(`getBridgeHostname: setASHToken: Error: ${message}`)
      throw Error()
    }
  }

  hostname = await queryBridgeHostname(dynamoDBDocumentClient, ashToken)
  if (hostname !== null) {
    return hostname
  }
  await setASHToken(dynamoDBDocumentClient, ashToken)
  hostname = await queryBridgeHostname(dynamoDBDocumentClient, ashToken)
  if (hostname !== null) {
    return hostname
  }
  return null
}

async function sendHandler (path: string, alexaRequest: ASH.Request, message: Request) : Promise<Response> {
  let hostname: String | null = null
  try {
    hostname = await getBridgeHostname(alexaRequest)
  } catch (error) {
    console.log(`sendHandler Error: getBridgeHostname Error: ${JSON.stringify(error)}`)
    throw Error(`sendHandler Error: getBridgeHostname Error: ${JSON.stringify(error)}`)
  }
  if (hostname === null) {
    throw Error('sendHandler Error: getBridgeHostname Error: hostname is null')
  }

  return await new Promise((resolve, reject): void => {
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
    if (token === null) {
      throw Error()
    }
    options.headers.authorization = `Bearer ${token}`
    options.headers['content-type'] = 'application/json'
    options.headers['content-length'] = Buffer.byteLength(content).toString()
    const request = https.request(options)
    request.once('response', (response): void => {
      let body: Response = {}
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

export async function sendLogMessage (alexaRequest: ASH.Request, alexaMessage : ASH.Request | ASH.Response): Promise<Response> {
  const logPath: string = `/${constants.bridge.path.base}/${constants.bridge.path.relativeLog}`
  return await send(logPath, alexaRequest, { log: alexaMessage })
}

export async function sendSkillDirective (request: ASH.Request): Promise<ASH.Response> {
  const ashPath: string = `/${constants.bridge.path.base}/${constants.bridge.path.relativeASH}`
  try {
    const response = ((await sendHandler(ashPath, request, request)) as ASH.Response)
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

export function send (path: string, alexaRequest: ASH.Request, message: Request): Promise<Response> {
  return sendHandler(path, alexaRequest, message)
}
