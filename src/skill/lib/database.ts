import DynamoDB from 'aws-sdk/clients/dynamodb'
import https from 'https'
import * as Common from '../../common'
import * as Debug from '../../common/debug'

let dynamoDBDocumentClient: DynamoDB.DocumentClient

function getDatabase (): DynamoDB.DocumentClient {
  if (typeof dynamoDBDocumentClient === 'undefined') {
    dynamoDBDocumentClient = new DynamoDB.DocumentClient({
      region: Common.constants.aws.region
    })
  }
  return dynamoDBDocumentClient
}

export async function setHostname (email: string, hostname: string): Promise<void> {
  const database = getDatabase()

  const hostnameUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression: 'set hostname = :newHostname',
    ExpressionAttributeValues: { ':newHostname': hostname }

  }
  Debug.debug(hostnameUpdateParams)
  Debug.debugJSON(hostnameUpdateParams)
  try {
    await database.update(hostnameUpdateParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }
}

export async function getHostname (bearerToken: string): Promise<string | null> {
  const database = getDatabase()

  const bearerTokenQueryParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    IndexName: Common.constants.aws.dynamoDB.indexName,
    KeyConditionExpression: '#bearerToken = :bearerToken_value',
    ExpressionAttributeNames: { '#bearerToken': 'bearerToken' },
    ExpressionAttributeValues: { ':bearerToken_value': bearerToken }
  }

  let data
  try {
    data = await database.query(bearerTokenQueryParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }

  if ((typeof data !== 'undefined') &&
      (typeof data.Count !== 'undefined') && (data.Count > 0) &&
      (typeof data.Items !== 'undefined') && typeof data.Items[0].hostname !== 'undefined') {
    const hostname = (data.Items[0].hostname as string)
    Debug.debug(`getBridgeHostname: queryBridgeHostname: hostname: ${hostname}`)
    return hostname
  }

  return null
}

export async function setBearerToken (email: string, bearerToken: string): Promise<void> {
  const database = getDatabase()

  const bearerTokenUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression: 'set bearerToken = :newBearerToken',
    ExpressionAttributeValues: { ':newBearerToken': bearerToken }
  }

  try {
    await database.update(bearerTokenUpdateParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }
}
