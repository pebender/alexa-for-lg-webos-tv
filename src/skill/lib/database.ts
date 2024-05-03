import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import * as Common from "../../common";

export type BridgeInformation = {
  hostname: string;
  bridgeToken: string;
};

export type Record = {
  email: string | null;
  skillToken: string | null;
  hostname: string | null;
  bridgeToken: string | null;
};

export type Field = "email" | "skillToken" | "hostname" | "bridgeToken";

const dynamoDBClient = new DynamoDBClient();

const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient);

function createDatabaseError(
  message: string,
  options?: { specific?: string; cause?: any },
) {
  const databaseErrorOptions: Common.Error.AlexaForLGwebOSTVErrorOptions = {
    general: "database",
    receiver: "skill_user_db",
  };
  Object.assign(databaseErrorOptions, options);
  return Common.Error.create(message, databaseErrorOptions);
}

async function getRecords(
  queryCommand: QueryCommand,
  options?: {
    required?: boolean;
    unique?: boolean;
    requiredFields?: Field[];
  },
): Promise<Record[]> {
  const required: boolean =
    typeof options === "undefined" || typeof options.required === "undefined"
      ? false
      : options.required;
  const unique: boolean =
    typeof options === "undefined" || typeof options.unique === "undefined"
      ? false
      : options.unique;
  const requiredFields =
    typeof options === "undefined" ||
    typeof options.requiredFields === "undefined"
      ? []
      : options.requiredFields;

  const records: Record[] = [];
  let data;
  try {
    data = await dynamoDBDocumentClient.send(queryCommand);
  } catch (cause) {
    throw createDatabaseError("", { cause });
  }

  if (
    typeof data === "undefined" ||
    typeof data.Count === "undefined" ||
    typeof data.Items === "undefined"
  ) {
    throw createDatabaseError("");
  }
  if (typeof required !== "undefined" && required && data.Count === 0) {
    throw createDatabaseError("", { specific: "not_found" });
  }
  if (typeof unique !== "undefined" && unique && data.Count > 1) {
    throw createDatabaseError("", { specific: "not_unique" });
  }

  data.Items.forEach((item) => {
    const record: Record = {
      email: null,
      skillToken: null,
      hostname: null,
      bridgeToken: null,
    };

    requiredFields.forEach((requiredField: string) => {
      if (!Object.hasOwn(item, requiredField)) {
        throw createDatabaseError("", {
          specific: `missing_field+${requiredField}`,
        });
      }
    });

    if (typeof item.email !== "undefined") {
      if (typeof item.email === "string") {
        record.email = item.email;
      } else {
        throw createDatabaseError(
          `invalid type. field 'email' should be type 'string' but was type '${typeof item.email}'`,
          { specific: "invalid_field+email" },
        );
      }
    }
    if (typeof item.skillToken !== "undefined") {
      if (typeof item.skillToken === "string") {
        record.skillToken = item.skillToken;
      } else {
        throw createDatabaseError(
          `invalid type. field 'skillToken' should be type 'string' but was type '${typeof item.skillToken}'`,
          { specific: "invalid_field+skillToken" },
        );
      }
    }
    if (typeof item.hostname !== "undefined") {
      if (typeof item.hostname === "string") {
        record.hostname = item.hostname;
      } else {
        throw createDatabaseError(
          `invalid type. field 'hostname' should be type 'string' but was type '${typeof item.hostname}'`,
          { specific: "invalid_field+hostname" },
        );
      }
    }
    if (typeof item.bridgeToken !== "undefined") {
      if (typeof item.bridgeToken === "string") {
        record.bridgeToken = item.bridgeToken;
      } else {
        throw createDatabaseError(
          `invalid type. field 'bridgeToken' should be type 'string' but was type '${typeof item.bridgeToken}'`,
          { specific: "invalid_field+bridgeToken" },
        );
      }
    }

    records.push(record);
  });

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

export async function getRecordUsingEmail(
  email: string,
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
    KeyConditionExpression: "#email = :email_value",
    ExpressionAttributeNames: { "#email": "email" },
    ExpressionAttributeValues: { ":email_value": email },
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
  return getRecordUsingSkillToken(skillToken, newOptions) as Promise<Record>;
}

export async function getRequiredRecordUsingEmail(
  email: string,
  options?: { requiredFields?: Field[] },
): Promise<Record> {
  const newOptions: {
    required?: boolean;
    requiredFields?: Field[];
  } = {};
  Object.assign(newOptions, options);
  newOptions.required = true;
  return getRecordUsingEmail(email, newOptions) as Promise<Record>;
}

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
    throw createDatabaseError("", { cause });
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
    throw createDatabaseError("", { cause });
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
    throw createDatabaseError("", { cause });
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
    throw createDatabaseError("", { cause });
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
    throw createDatabaseError("", { cause });
  }
}
