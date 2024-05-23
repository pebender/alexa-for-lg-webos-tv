import * as crypto from "node:crypto";
import * as Common from "../../../../common";
import { DatabaseTable } from "../../database";
import type { Configuration } from "../../configuration";
import { authorizeUser } from "./authorize-user";

export interface BridgeTokenAuthRecord {
  bridgeToken: string;
  bridgeHostname: string;
  email: string;
  userId: string;
  skillToken: string;
}

export type BridgeTokenAuthField =
  | "bridgeToken"
  | "bridgeHostname"
  | "email"
  | "userId"
  | "skillToken";

export class BridgeTokenAuth {
  private readonly _configuration: Configuration;
  private readonly _database: DatabaseTable;
  private constructor(_configuration: Configuration, _database: DatabaseTable) {
    this._configuration = _configuration;
    this._database = _database;
  }

  public static async build(
    configuration: Configuration,
  ): Promise<BridgeTokenAuth> {
    const _database = await DatabaseTable.build(
      "frontend",
      ["bridgeToken", "bridgeHostname", "email", "userId", "skillToken"],
      "bridgeToken",
    );

    const bridgeTokenAuth = new BridgeTokenAuth(configuration, _database);

    return bridgeTokenAuth;
  }

  public generateBridgeToken(): string {
    return crypto.randomBytes(512).toString("base64").slice(0, 256);
  }

  public async setBridgeToken(
    bridgeToken: string,
    bridgeHostname: string,
    email: string,
    userId: string,
    skillToken: string,
  ): Promise<void> {
    const record = { bridgeToken, bridgeHostname, email, userId, skillToken };
    Common.Debug.debug("setBridgeToken");
    Common.Debug.debugJSON(record);
    await this._database.updateOrInsertRecord(
      { $and: [{ bridgeHostname }, { email }] },
      record,
    );
  }

  public async getBridgeToken(
    bridgeToken: string,
  ): Promise<BridgeTokenAuthRecord | null> {
    // get bridgeToken record.
    const record = await this._database.getRecord({ bridgeToken });
    if (record === null) {
      return null;
    }
    Common.Debug.debug("getBridgeToken");
    Common.Debug.debugJSON(record);

    // bad bridgeToken record.
    if (
      typeof record.bridgeToken !== "string" ||
      typeof record.bridgeHostname !== "string" ||
      typeof record.email !== "string" ||
      typeof record.userId !== "string" ||
      typeof record.skillToken !== "string"
    ) {
      await this._database.deleteRecord({ bridgeToken });
      return null;
    }

    return {
      bridgeToken: record.bridgeToken,
      bridgeHostname: record.bridgeHostname,
      email: record.email,
      userId: record.userId,
      skillToken: record.skillToken,
    };
  }

  public async authorizeBridgeToken(
    bridgeToken: string,
  ): Promise<BridgeTokenAuthRecord | null> {
    const record = await this.getBridgeToken(bridgeToken);
    if (record === null) {
      return null;
    }

    const authorized = authorizeUser(
      this._configuration,
      record.bridgeHostname,
      record.email,
    );
    if (!authorized) {
      await this._database.deleteRecord({ bridgeToken });
      return null;
    }

    return record;
  }
}
