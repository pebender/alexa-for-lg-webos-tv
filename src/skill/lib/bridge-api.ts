import * as ASH from '../../common/alexa'
import { constants } from '../../common/constants'
import { DynamoDB } from 'aws-sdk'
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
      throw ASH.errorResponseFromError(alexaRequest, error)
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
      throw ASH.errorResponseFromError(alexaRequest, error)
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

async function sendHandler (path: string, alexaRequest: ASH.Request, message: Request) : Promise<ASH.Response> {
  const outputStack = true

  let hostname: String | null = null
  try {
    hostname = await getBridgeHostname(alexaRequest)
  } catch (error) {
    const response = ASH.errorResponseFromError(alexaRequest, error)
    if ((outputStack) && ('stack' in (response as any))) {
      console.log((response as any).stack)
    }
    return response.response
  }
  if (hostname === null) {
    const response = ASH.errorResponse(
      alexaRequest,
      null,
      'BRIDGE_UNREACHABLE',
      'Bridge hostname has not been configured'
    )
    if ((outputStack) && ('stack' in (response as any))) {
      console.log((response as any).stack)
    }
    return response.response
  }

  const response: ASH.Response | ASH.ResponseCapsule = await new Promise((resolve): void => {
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
          resolve(ASH.errorResponse(
            alexaRequest,
            null,
            'INTERNAL_ERROR',
            'Bridge response did not return an HTTP StatusCode.'
          ))
        }
        // The expected HTTP/1.1 'content-type' header is 'application/json'
        const contentType = res.headers['content-type']
        if (typeof contentType === 'undefined') {
          resolve(ASH.errorResponse(
            alexaRequest,
            null,
            'INTERNAL_ERROR',
            'Bridge response did not return HTTP header \'content-type\'.'))
        }
        if (!(/^application\/json/).test((contentType as string).toLowerCase())) {
          resolve(ASH.errorResponse(
            alexaRequest,
            null,
            'INTERNAL_ERROR',
            `Bridge response included an incorrect HTTP header 'content-type' of '${contentType?.toLocaleLowerCase()}'.`))
        }
        // Validate the body.
        try {
          body = JSON.parse(data)
        } catch (error) {
          resolve(ASH.errorResponseFromError(alexaRequest, error))
        }
        // Return the body.
        resolve((body as ASH.Response))
      })
    })
    req.on('error', (error: Error): void => {
      resolve(ASH.errorResponse(
        alexaRequest,
        null,
        'INTERNAL_ERROR',
        `${error.message} (${error.name})'.`).response)
    })
    req.write(content)
    req.end()
  })
  if (response instanceof ASH.ResponseCapsule) {
    if ((outputStack) && ('stack' in (response as any))) {
      console.log((response as any).stack)
    }
    return response.response
  }
  return response
}

export async function sendSkillDirective (request: ASH.Request): Promise<ASH.Response> {
  const outputStack = true
  const ashPath: string = `/${constants.bridge.path}`
  try {
    const response = await sendHandler(ashPath, request, request)
    if (response instanceof ASH.ResponseCapsule) {
      if ((outputStack) && ('stack' in (response as any))) {
        console.log((response as any).stack)
      }
      return response.response
    }
    return response
  } catch (error) {
    const response = ASH.errorResponseFromError(request, error)
    if ((outputStack) && ('stack' in (response as any))) {
      console.log((response as any).stack)
    }
    return response.response
  }
}

export function send (path: string, alexaRequest: ASH.Request, message: Request): Promise<Response> {
  return sendHandler(path, alexaRequest, message)
}
