import * as crypto from "crypto";
import { DatabaseTable } from "../../database";
import { Configuration } from "../../configuration";
import { AuthorizationHandler } from "../auth";

export class BridgeTokenAuth {
  private readonly _configuration: Configuration;
  private readonly _authorizationHandler: AuthorizationHandler;
  private readonly _db: DatabaseTable;
  private constructor(
    _configuration: Configuration,
    _authorizationHandler: AuthorizationHandler,
    _db: DatabaseTable,
  ) {
    this._configuration = _configuration;
    this._authorizationHandler = _authorizationHandler;
    this._db = _db;
  }

  public static async build(
    configuration: Configuration,
    authorizationHandler: AuthorizationHandler,
  ): Promise<BridgeTokenAuth> {
    const _db = await DatabaseTable.build(
      "frontend",
      ["bridgeToken", "service", "user"],
      "bridgeToken",
    );

    const bridgeTokenAuth = new BridgeTokenAuth(
      configuration,
      authorizationHandler,
      _db,
    );

    return bridgeTokenAuth;
  }

  public generateBridgeToken(): string {
    return crypto.randomBytes(512).toString("base64").slice(0, 256);
  }

  public async setBridgeToken(
    bridgeToken: string,
    service: string,
    user: string,
  ): Promise<void> {
    await this._db.updateOrInsertRecord(
      { $and: [{ service }, { user }] },
      { bridgeToken, service, user },
    );
  }

  public async getBridgeToken(
    bridgeToken: string,
  ): Promise<{ service: string; user: string } | null> {
    // get bridgeToken record.
    const record = await this._db.getRecord({ bridgeToken });
    if (record === null) {
      return null;
    }

    // bad bridgeToken record.
    if (typeof record.service !== "string" || typeof record.user !== "string") {
      await this._db.deleteRecord({ bridgeToken });
      return null;
    }

    return {
      service: record.service,
      user: record.user,
    };
  }

  public async authorizeBridgeToken(
    bridgeToken: string,
  ): Promise<string | null> {
    const record = await this.getBridgeToken(bridgeToken);
    if (record === null) {
      return null;
    }

    const service = record.service;
    const user = record.user;

    const authorized = await this._authorizationHandler(
      this._configuration,
      service,
      user,
    );
    if (authorized === false) {
      await this._db.deleteRecord({ bridgeToken });
      return null;
    }

    return user;
  }
}
