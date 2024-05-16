import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  type QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import * as Common from "../../../common";

export interface Record {
  userId: string | null;
  skillToken: string | null;
  bridgeHostname: string | null;
  bridgeToken: string | null;
}

export type Field = "userId" | "skillToken" | "bridgeHostname" | "bridgeToken";

const dynamoDBClient = new DynamoDBClient();

const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient);

function createDatabaseError(options?: {
  message?: string;
  specific?: string;
  cause?: unknown;
}): Common.Error.CommonError {
  const databaseErrorOptions: Common.Error.CommonErrorOptions = {
    general: "database",
  };
  Object.assign(databaseErrorOptions, options);
  return Common.Error.create(databaseErrorOptions);
}

async function getRecords(
  queryCommand: QueryCommand,
  options?: {
    required?: boolean;
    unique?: boolean;
    requiredFields?: Field[];
  },
): Promise<Record[]> {
  const required = options?.required ?? false;
  const unique = options?.unique ?? false;
  const requiredFields = options?.requiredFields ?? [];

  const records: Record[] = [];
  let data;
  try {
    data = await dynamoDBDocumentClient.send(queryCommand);
  } catch (cause) {
    throw createDatabaseError({ cause });
  }

  if (data.Count === undefined || data.Items === undefined) {
    throw createDatabaseError();
  }
  if (required && data.Count === 0) {
    throw createDatabaseError({ specific: "not_found" });
  }
  if (unique && data.Count > 1) {
    throw createDatabaseError({ specific: "not_unique" });
  }

  for (const item of data.Items) {
    const record: Record = {
      userId: null,
      skillToken: null,
      bridgeHostname: null,
      bridgeToken: null,
    };

    for (const requiredField of requiredFields) {
      if (!Object.hasOwn(item, requiredField)) {
        throw createDatabaseError({
          specific: `missing_field+${requiredField}`,
        });
      }
    }

    if (item.userId !== undefined) {
      if (typeof item.userId === "string") {
        record.userId = item.userId === "" ? null : item.userId;
      } else {
        throw createDatabaseError({
          message: `invalid type. field 'userId' should be type 'string' but was type '${typeof item.userId}'`,
          specific: "invalid_field+userId",
        });
      }
    }
    if (item.skillToken !== undefined) {
      if (typeof item.skillToken === "string") {
        record.skillToken = item.skillToken === "" ? null : item.skillToken;
      } else {
        throw createDatabaseError({
          message: `invalid type. field 'skillToken' should be type 'string' but was type '${typeof item.skillToken}'`,
          specific: "invalid_field+skillToken",
        });
      }
    }
    if (item.bridgeHostname !== undefined) {
      if (typeof item.bridgeHostname === "string") {
        record.bridgeHostname =
          item.bridgeHostname === "" ? null : item.bridgeHostname;
      } else {
        throw createDatabaseError({
          message: `invalid type. field 'bridgeHostname' should be type 'string' but was type '${typeof item.bridgeHostname}'`,
          specific: "invalid_field+bridgeHostname",
        });
      }
    }
    if (item.bridgeToken !== undefined) {
      if (typeof item.bridgeToken === "string") {
        record.bridgeToken = item.bridgeToken === "" ? null : item.bridgeToken;
      } else {
        throw createDatabaseError({
          message: `invalid type. field 'bridgeToken' should be type 'string' but was type '${typeof item.bridgeToken}'`,
          specific: "invalid_field+bridgeToken",
        });
      }
    }

    records.push(record);
  }

  return records;
}

export async function getRecordUsingSkillToken(
  skillToken: string,
  options?: { required?: boolean; requiredFields?: Field[] },
): Promise<Record | null> {
  const newOptions: {
    required?: boolean;
    unique?: boolean;
    requiredFields?: Field[];
  } = {};
  Object.assign(newOptions, options);
  newOptions.unique = true;

  const queryCommandInput: QueryCommandInput = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    IndexName: Common.constants.aws.dynamoDB.indexName,
    KeyConditionExpression: "#skillToken = :skillToken_value",
    ExpressionAttributeNames: { "#skillToken": "skillToken" },
    ExpressionAttributeValues: { ":skillToken_value": skillToken },
  };
  const queryCommand: QueryCommand = new QueryCommand(queryCommandInput);
  const records: Record[] = await getRecords(queryCommand, newOptions);
  if (records.length === 0) {
    return null;
  } else {
    return records[0];
  }
}

export async function getRecordUsingUserId(
  userId: string,
  options?: { required?: boolean; requiredFields?: Field[] },
): Promise<Record | null> {
  const newOptions: {
    required?: boolean;
    unique?: boolean;
    requiredFields?: Field[];
  } = {};
  Object.assign(newOptions, options);
  newOptions.unique = true;

  const queryCommandInput: QueryCommandInput = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    KeyConditionExpression: "#userId = :userId_value",
    ExpressionAttributeNames: { "#userId": "userId" },
    ExpressionAttributeValues: { ":userId_value": userId },
  };
  const queryCommand: QueryCommand = new QueryCommand(queryCommandInput);
  const records: Record[] = await getRecords(queryCommand, newOptions);
  if (records.length === 0) {
    return null;
  } else {
    return records[0];
  }
}

export async function getRequiredRecordUsingSkillToken(
  skillToken: string,
  options?: { requiredFields?: Field[] },
): Promise<Record> {
  const newOptions: {
    required?: boolean;
    requiredFields?: Field[];
  } = {};
  Object.assign(newOptions, options);
  newOptions.required = true;
  return await (getRecordUsingSkillToken(
    skillToken,
    newOptions,
  ) as Promise<Record>);
}

export async function getRequiredRecordUsingUserId(
  userId: string,
  options?: { requiredFields?: Field[] },
): Promise<Record> {
  const newOptions: {
    required?: boolean;
    requiredFields?: Field[];
  } = {};
  Object.assign(newOptions, options);
  newOptions.required = true;
  return await (getRecordUsingUserId(userId, newOptions) as Promise<Record>);
}

export async function setBridgeHostname(
  userId: string,
  bridgeHostname: string,
): Promise<void> {
  const bridgeHostnameUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { userId },
    UpdateExpression:
      "set bridgeHostname = :newBridgeHostname, bridgeToken = :newBridgeToken",
    ExpressionAttributeValues: {
      ":newBridgeHostname": bridgeHostname,
      ":newBridgeToken": "",
    },
  };
  Common.Debug.debug("bridgeHostnameUpdateParams");
  Common.Debug.debugJSON(bridgeHostnameUpdateParams);
  try {
    await dynamoDBDocumentClient.send(
      new UpdateCommand(bridgeHostnameUpdateParams),
    );
  } catch (cause) {
    Common.Debug.debugError(cause);
    throw createDatabaseError({ cause });
  }
}

export async function setBridgeCredentials(
  userId: string,
  bridgeCredentials: { bridgeHostname: string; bridgeToken: string },
): Promise<void> {
  const bridgeCredentialsUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { userId },
    UpdateExpression:
      "set bridgeHostname = :newBridgeHostname, bridgeToken = :newBridgeToken",
    ExpressionAttributeValues: {
      ":newBridgeHostname": bridgeCredentials.bridgeHostname,
      ":newBridgeToken": bridgeCredentials.bridgeToken,
    },
  };
  Common.Debug.debug("bridgeCredentialsUpdateParams");
  Common.Debug.debugJSON(bridgeCredentialsUpdateParams);
  try {
    await dynamoDBDocumentClient.send(
      new UpdateCommand(bridgeCredentialsUpdateParams),
    );
  } catch (cause) {
    Common.Debug.debugError(cause);
    throw createDatabaseError({ cause });
  }
}

export async function setSkillToken(
  userId: string,
  skillToken: string,
): Promise<void> {
  const skillTokenUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { userId },
    UpdateExpression: "set skillToken = :newSkillToken",
    ExpressionAttributeValues: { ":newSkillToken": skillToken },
  };

  try {
    await dynamoDBDocumentClient.send(
      new UpdateCommand(skillTokenUpdateParams),
    );
  } catch (cause) {
    Common.Debug.debugError(cause);
    throw createDatabaseError({ cause });
  }
}
