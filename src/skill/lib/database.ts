import DynamoDB from 'aws-sdk/clients/dynamodb'
import https from 'https'
import { constants } from '../../common/constants'

let dynamoDBDocumentClient: DynamoDB.DocumentClient

function getDatabase (): DynamoDB.DocumentClient {
  if (typeof dynamoDBDocumentClient === 'undefined') {
    const agent = new https.Agent({
      keepAlive: true
    })
    dynamoDBDocumentClient = new DynamoDB.DocumentClient({
      httpOptions: {
        agent
      },
      region: constants.aws.region
    })
  }
  return dynamoDBDocumentClient
}

export async function setHostname (email: string, hostname: string): Promise<void> {
  const database = getDatabase()

  const hostnameUpdateParams = {
    TableName: constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression: 'set hostname = :newHostname',
    ExpressionAttributeValues: { ':newHostname': hostname }

  }
  await database.update(hostnameUpdateParams).promise()
}

export async function getHostname (ashToken: string): Promise<string | null> {
  const database = getDatabase()

  const ashTokenQueryParams = {
    TableName: constants.aws.dynamoDB.tableName,
    IndexName: constants.aws.dynamoDB.indexName,
    KeyConditionExpression: '#ashToken = :ashToken_value',
    ExpressionAttributeNames: { '#ashToken': 'ashToken' },
    ExpressionAttributeValues: { ':ashToken_value': ashToken }
  }

  const data = await database.query(ashTokenQueryParams).promise()

  if ((typeof data.Count !== 'undefined') && (data.Count > 0) &&
    (typeof data.Items !== 'undefined') && typeof data.Items[0].hostname !== 'undefined') {
    const hostname = (data.Items[0].hostname as string)
    console.log(`getBridgeHostname: queryBridgeHostname: hostname: ${hostname}`)
    return hostname
  }

  return null
}

export async function setASHToken (email: string, ashToken: string): Promise<void> {
  const database = getDatabase()

  const ashTokenUpdateParams = {
    TableName: constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression: 'set ashToken = :newAshToken',
    ExpressionAttributeValues: { ':newAshToken': ashToken }
  }

  await database.update(ashTokenUpdateParams).promise()
}
