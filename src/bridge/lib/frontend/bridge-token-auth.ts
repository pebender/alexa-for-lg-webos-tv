import * as crypto from "node:crypto";
import * as Common from "../../../common";
import { DatabaseTable } from "../database";
import type { Configuration } from "../configuration";
import { authorizeUser } from "./authorize-user";

/* This is a type because DatabaseTable needs it to be a type. */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type BridgeTokenAuthRecord = {
  bridgeToken: string;
  bridgeHostname: string;
  email: string;
  userId: string;
  skillToken: string;
};

export class BridgeTokenAuth {
  private readonly _configuration: Configuration;
  private readonly _database: DatabaseTable<BridgeTokenAuthRecord>;
  private constructor(
    _configuration: Configuration,
    _database: DatabaseTable<BridgeTokenAuthRecord>,
  ) {
    this._configuration = _configuration;
    this._database = _database;
  }

  public static async build(
    configuration: Configuration,
  ): Promise<BridgeTokenAuth> {
    const _database = await DatabaseTable.build<BridgeTokenAuthRecord>(
      "frontend",
      ["bridgeToken", "userId", "skillToken"],
    );

    const bridgeTokenAuth = new BridgeTokenAuth(configuration, _database);

    return bridgeTokenAuth;
  }

  public generateBridgeToken(): string {
    return crypto.randomBytes(512).toString("base64").slice(0, 256);
  }

  public async setBridgeToken(record: BridgeTokenAuthRecord): Promise<void> {
    Common.Debug.debug("setBridgeToken");
    Common.Debug.debugJSON(record);
    await this._database.updateOrInsertRecord(
      [{ bridgeHostname: record.bridgeHostname }, { email: record.email }],
      record,
    );
  }

  public async getBridgeToken(
    bridgeToken: string,
  ): Promise<BridgeTokenAuthRecord | undefined> {
    // get bridgeToken record.
    return await this._database.getRecord({ bridgeToken });
  }

  public async authorizeBridgeToken(
    bridgeToken: string,
  ): Promise<BridgeTokenAuthRecord | undefined> {
    const record = await this.getBridgeToken(bridgeToken);
    if (record === undefined) {
      return undefined;
    }

    const authorized = authorizeUser(
      this._configuration,
      record.bridgeHostname,
      record.email,
    );
    if (!authorized) {
      await this._database.deleteRecords({ bridgeToken });
      return undefined;
    }

    return record;
  }
}
