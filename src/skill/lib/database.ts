import DynamoDB from 'aws-sdk/clients/dynamodb'
import * as Common from '../../common'
import * as Debug from '../../common/debug'

const dynamoDBDocumentClient = new DynamoDB.DocumentClient({
  region: Common.constants.aws.region
})

export async function setHostname (email: string, hostname: string): Promise<void> {
  const hostnameUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression: 'set hostname = :newHostname',
    ExpressionAttributeValues: { ':newHostname': hostname }

  }
  Debug.debug('hostnameUpdateParams')
  Debug.debugJSON(hostnameUpdateParams)
  try {
    await dynamoDBDocumentClient.update(hostnameUpdateParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }
}

export async function getHostname (bearerToken: string): Promise<string | null> {
  const bearerTokenQueryParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    IndexName: Common.constants.aws.dynamoDB.indexName,
    KeyConditionExpression: '#bearerToken = :bearerToken_value',
    ExpressionAttributeNames: { '#bearerToken': 'bearerToken' },
    ExpressionAttributeValues: { ':bearerToken_value': bearerToken }
  }

  let data
  try {
    data = await dynamoDBDocumentClient.query(bearerTokenQueryParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }

  if ((typeof data !== 'undefined') &&
      (typeof data.Count !== 'undefined') && (data.Count > 0) &&
      (typeof data.Items !== 'undefined') && typeof data.Items[0].hostname !== 'undefined') {
    const hostname = (data.Items[0].hostname as string)
    Debug.debug(`getHostname: hostname: ${hostname}`)
    return hostname
  }

  return null
}

export async function setBridgeToken (email: string, bridgeToken: string): Promise<void> {
  const bridgeTokenUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression: 'set bridgeToken = :newBridgeToken',
    ExpressionAttributeValues: { ':newBridgeToken': bridgeToken }

  }
  Debug.debug('bridgeTokenUpdateParams')
  Debug.debugJSON(bridgeTokenUpdateParams)
  try {
    await dynamoDBDocumentClient.update(bridgeTokenUpdateParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }
}

export async function getBridgeToken (bearerToken: string): Promise<string | null> {
  const bearerTokenQueryParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    IndexName: Common.constants.aws.dynamoDB.indexName,
    KeyConditionExpression: '#bearerToken = :bearerToken_value',
    ExpressionAttributeNames: { '#bearerToken': 'bearerToken' },
    ExpressionAttributeValues: { ':bearerToken_value': bearerToken }
  }

  let data
  try {
    data = await dynamoDBDocumentClient.query(bearerTokenQueryParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }

  if ((typeof data !== 'undefined') &&
      (typeof data.Count !== 'undefined') && (data.Count > 0) &&
      (typeof data.Items !== 'undefined') && typeof data.Items[0].bridgeToken !== 'undefined') {
    const bridgeToken = (data.Items[0].bridgeToken as string)
    Debug.debug(`getHostname: bridgeToken: ${bridgeToken}`)
    return bridgeToken
  }

  return null
}

export async function getEmail (bearerToken: string): Promise<string | null> {
  const bearerTokenQueryParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    IndexName: Common.constants.aws.dynamoDB.indexName,
    KeyConditionExpression: '#bearerToken = :bearerToken_value',
    ExpressionAttributeNames: { '#bearerToken': 'bearerToken' },
    ExpressionAttributeValues: { ':bearerToken_value': bearerToken }
  }

  let data
  try {
    data = await dynamoDBDocumentClient.query(bearerTokenQueryParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }

  if ((typeof data !== 'undefined') &&
      (typeof data.Count !== 'undefined') && (data.Count > 0) &&
      (typeof data.Items !== 'undefined') && typeof data.Items[0].hostname !== 'undefined') {
    const email = (data.Items[0].email as string)
    Debug.debug(`getEmail: email: ${email}`)
    return email
  }

  return null
}

export async function setBearerToken (email: string, bearerToken: string): Promise<void> {
  const bearerTokenUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression: 'set bearerToken = :newBearerToken',
    ExpressionAttributeValues: { ':newBearerToken': bearerToken }
  }

  try {
    await dynamoDBDocumentClient.update(bearerTokenUpdateParams).promise()
  } catch (error) {
    Debug.debugErrorWithStack(error)
    throw error
  }
}
