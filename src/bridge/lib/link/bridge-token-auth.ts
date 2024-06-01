import * as crypto from "node:crypto";
import * as Common from "../../../common";
import { DatabaseTable } from "../database";
import type { Credentials } from "./credentials";
import type { UserAuth } from "./user-auth";

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
  private readonly _userAuth: UserAuth;
  private readonly _database: DatabaseTable<BridgeTokenAuthRecord>;
  private constructor(
    _userAuth: UserAuth,
    _database: DatabaseTable<BridgeTokenAuthRecord>,
  ) {
    this._userAuth = _userAuth;
    this._database = _database;
  }

  public static async build(
    userAuth: UserAuth,
    configurationDirectory: string,
  ): Promise<BridgeTokenAuth> {
    const _database = await DatabaseTable.build<BridgeTokenAuthRecord>(
      configurationDirectory,
      "link",
      ["bridgeToken", "userId", "skillToken"],
    );

    const bridgeTokenAuth = new BridgeTokenAuth(userAuth, _database);

    return bridgeTokenAuth;
  }

  public generateBridgeToken(): string {
    let bridgeToken: string | undefined;
    while (bridgeToken === undefined) {
      bridgeToken = crypto.randomBytes(192).toString("base64url").slice(0, 256);
      if (this.getCredentials(bridgeToken) === null) {
        bridgeToken = undefined;
      }
    }
    return bridgeToken;
  }

  public async setCredentials(
    bridgeToken: string,
    credentials: Credentials,
  ): Promise<void> {
    Common.Debug.debug("setBridgeToken");
    const record: BridgeTokenAuthRecord = { bridgeToken, ...credentials };
    Common.Debug.debugJSON(record);
    await this._database.updateOrInsertRecord(
      [{ bridgeHostname: record.bridgeHostname }, { email: record.email }],
      record,
    );
  }

  public async getCredentials(
    bridgeToken: string,
  ): Promise<Credentials | null> {
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
      await this._database.deleteRecords({ bridgeToken });
      return null;
    }

    return {
      bridgeHostname: record.bridgeHostname,
      email: record.email,
      userId: record.userId,
      skillToken: record.skillToken,
    };
  }

  public async authorizeBridgeToken(
    bridgeToken: string,
  ): Promise<Credentials | null> {
    const record = await this.getCredentials(bridgeToken);
    if (record === null) {
      return null;
    }

    const authorized = this._userAuth.authorizeUser(
      record.bridgeHostname,
      record.email,
    );
    if (!authorized) {
      await this._database.deleteRecords({ bridgeToken });
      return null;
    }

    return record;
  }
}
