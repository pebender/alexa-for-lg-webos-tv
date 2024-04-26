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
      ["email", "hostname", "bridgeToken"],
      "email",
    );

    const bridgeTokenAuth = new BridgeTokenAuth(configuration, _db);

    return bridgeTokenAuth;
  }

  public generateBridgeToken(): string {
    return crypto.randomBytes(512).toString("base64").slice(0, 256);
  }

  public async setBridgeToken(
    email: string,
    hostname: string,
    bridgeToken: string,
  ): Promise<void> {
    await this._db.updateOrInsertRecord(
      { email },
      { email, hostname, bridgeToken },
    );
  }

  public async authorizeBridgeToken(
    bridgeToken: string,
  ): Promise<string | null> {
    const record = await this._db.getRecord({ bridgeToken });
    if (record === null) {
      return null;
    }
    if (
      typeof record.email !== "string" ||
      typeof record.hostname !== "string"
    ) {
      await this._db.deleteRecord({ bridgeToken });
      return null;
    }

    const email = record.email;
    const hostname = record.hostname;

    // CHeck if the email is still authorized and delete the record if it is not.
    const authorizedEmails = await this._configuration.authorizedEmails();
    const found = authorizedEmails.find(
      (authorizedEmail) => email === authorizedEmail,
    );
    if (typeof found === "undefined") {
      await this._db.deleteRecord({ bridgeToken });
      return null;
    }

    // Make sure the hostname is still authorized and delete the record if it is
    // not.
    const authorizedHostname = await this._configuration.hostname();
    if (hostname !== authorizedHostname) {
      await this._db.deleteRecord({ bridgeToken });
      return null;
    }

    return email;
  }
}
