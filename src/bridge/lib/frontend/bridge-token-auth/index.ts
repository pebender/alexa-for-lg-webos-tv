import * as crypto from "crypto";
import { DatabaseTable } from "../../database";
import { Configuration } from "../../configuration";

export class BridgeTokenAuth {
  private readonly _configuration: Configuration;
  private readonly _db: DatabaseTable;
  private constructor(_configuration: Configuration, _db: DatabaseTable) {
    this._configuration = _configuration;
    this._db = _db;
  }

  public static async build(
    configuration: Configuration,
  ): Promise<BridgeTokenAuth> {
    const _db = await DatabaseTable.build(
      "frontend",
      ["bridgeToken", "service", "user"],
      "bridgeToken",
    );

    const bridgeTokenAuth = new BridgeTokenAuth(configuration, _db);

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

  public async authorizeBridgeToken(
    bridgeToken: string,
  ): Promise<string | null> {
    const record = await this._db.getRecord({ bridgeToken });
    if (record === null) {
      return null;
    }
    if (typeof record.user !== "string" || typeof record.service !== "string") {
      await this._db.deleteRecord({ bridgeToken });
      return null;
    }

    const user = record.user;
    const service = record.service;

    // CHeck if the service+user is still authorized and delete the record if it is not.
    const authorizedServicesAndUsers =
      await this._configuration.authorizedServicesAndUsers();
    const authorizedService = authorizedServicesAndUsers.find(
      (authorizedService) => service === authorizedService.service,
    );
    if (typeof authorizedService === "undefined") {
      await this._db.deleteRecord({ bridgeToken });
      return null;
    }
    const authorizedUsers = authorizedService.users;
    const authorizedUser = authorizedUsers.find(
      (authorizedUser) => user === authorizedUser,
    );
    if (typeof authorizedUser === "undefined") {
      await this._db.deleteRecord({ bridgeToken });
      return null;
    }

    return user;
  }
}
