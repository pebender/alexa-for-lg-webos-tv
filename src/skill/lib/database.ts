import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import * as Common from "../../common";

export type BridgeInformation = {
  hostname: string;
  bridgeToken: string;
};

const dynamoDBClient = new DynamoDBClient();

const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export async function setBridgeInformation(
  email: string,
  bridgeInformation: BridgeInformation,
) {
  const bridgeInformationUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression:
      "set hostname = :newHostname, bridgeToken = :newBridgeToken",
    ExpressionAttributeValues: {
      ":newHostname": bridgeInformation.hostname,
      ":newBridgeToken": bridgeInformation.bridgeToken,
    },
  };
  Common.Debug.debug("bridgeInformationUpdateParams");
  Common.Debug.debugJSON(bridgeInformationUpdateParams);
  try {
    await dynamoDBDocumentClient.send(
      new UpdateCommand(bridgeInformationUpdateParams),
    );
  } catch (cause) {
    Common.Debug.debugErrorWithStack(cause);
    throw Common.Error.create("", { general: "database", cause });
  }
}

export async function getBridgeInformationUsingEmail(
  email: string,
): Promise<BridgeInformation | null> {
  const skillTokenQueryParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    KeyConditionExpression: "#email = :email_value",
    ExpressionAttributeNames: { "#email": "email" },
    ExpressionAttributeValues: { ":email_value": email },
  };

  let data;
  try {
    data = await dynamoDBDocumentClient.send(
      new QueryCommand(skillTokenQueryParams),
    );
  } catch (cause) {
    Common.Debug.debugErrorWithStack(cause);
    throw Common.Error.create("", { general: "database", cause });
  }

  if (
    typeof data !== "undefined" &&
    typeof data.Count !== "undefined" &&
    data.Count > 0 &&
    typeof data.Items !== "undefined" &&
    typeof data.Items[0].hostname !== "undefined" &&
    typeof data.Items[0].bridgeToken !== "undefined"
  ) {
    const hostname = data.Items[0].hostname as string;
    const bridgeToken = data.Items[0].bridgeToken as string;
    Common.Debug.debug(`getHostname: hostname: ${hostname}`);
    return {
      hostname,
      bridgeToken,
    };
  }

  return null;
}

export async function getBridgeInformation(
  skillToken: string,
): Promise<BridgeInformation | null> {
  const skillTokenQueryParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    IndexName: Common.constants.aws.dynamoDB.indexName,
    KeyConditionExpression: "#skillToken = :skillToken_value",
    ExpressionAttributeNames: { "#skillToken": "skillToken" },
    ExpressionAttributeValues: { ":skillToken_value": skillToken },
  };

  let data;
  try {
    data = await dynamoDBDocumentClient.send(
      new QueryCommand(skillTokenQueryParams),
    );
  } catch (cause) {
    throw Common.Error.create("", { general: "database", cause });
  }

  if (
    typeof data !== "undefined" &&
    typeof data.Count !== "undefined" &&
    data.Count > 0 &&
    typeof data.Items !== "undefined" &&
    typeof data.Items[0].hostname !== "undefined" &&
    typeof data.Items[0].bridgeToken !== "undefined"
  ) {
    const hostname = data.Items[0].hostname as string;
    const bridgeToken = data.Items[0].bridgeToken as string;
    Common.Debug.debug(`getHostname: hostname: ${hostname}`);
    return {
      hostname,
      bridgeToken,
    };
  }

  return null;
}

export async function getEmail(skillToken: string): Promise<string | null> {
  const skillTokenQueryParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    IndexName: Common.constants.aws.dynamoDB.indexName,
    KeyConditionExpression: "#skillToken = :skillToken_value",
    ExpressionAttributeNames: { "#skillToken": "skillToken" },
    ExpressionAttributeValues: { ":skillToken_value": skillToken },
  };

  let data;
  try {
    data = await dynamoDBDocumentClient.send(
      new QueryCommand(skillTokenQueryParams),
    );
  } catch (cause) {
    throw Common.Error.create("", { general: "database", cause });
  }

  if (
    typeof data !== "undefined" &&
    typeof data.Count !== "undefined" &&
    data.Count > 0 &&
    typeof data.Items !== "undefined" &&
    typeof data.Items[0].hostname !== "undefined"
  ) {
    const email = data.Items[0].email as string;
    Common.Debug.debug(`getEmail: email: ${email}`);
    return email;
  }

  return null;
}

export async function setSkillToken(
  email: string,
  skillToken: string,
): Promise<void> {
  const skillTokenUpdateParams = {
    TableName: Common.constants.aws.dynamoDB.tableName,
    Key: { email },
    UpdateExpression: "set skillToken = :newSkillToken",
    ExpressionAttributeValues: { ":newSkillToken": skillToken },
  };

  try {
    await dynamoDBDocumentClient.send(
      new UpdateCommand(skillTokenUpdateParams),
    );
  } catch (cause) {
    Common.Debug.debugErrorWithStack(cause);
    throw Common.Error.create("", { general: "database", cause });
  }
}
