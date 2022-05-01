import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { JwtPayload } from "jsonwebtoken";
import * as Common from "../../../../common";
import { DatabaseTable } from "../../database";
import { Configuration } from "../../configuration";

export class Authorization {
  private readonly _configuration: Configuration;
  private readonly _x509PublicCert: Buffer;
  private readonly _db: DatabaseTable;
  private constructor(
    _configuration: Configuration,
    _x509PublicCert: Buffer,
    _db: DatabaseTable
  ) {
    this._configuration = _configuration;
    this._x509PublicCert = _x509PublicCert;
    this._db = _db;
  }

  public static async build(
    configuration: Configuration
  ): Promise<Authorization> {
    const _x509PublicCert = fs.readFileSync(
      path.join(__dirname, Common.constants.bridge.jwt.x509PublicCertFile)
    );
    const _db = await DatabaseTable.build(
      "frontend",
      ["email", "hostname", "bridgeToken"],
      "email"
    );

    const authorization = new Authorization(
      configuration,
      _x509PublicCert,
      _db
    );

    return authorization;
  }

  public x509PublicCert(): Buffer {
    return this._x509PublicCert;
  }

  public async authorizeJwTPayload(jwtPayload: JwtPayload): Promise<boolean> {
    const that = this;

    if (typeof jwtPayload.iss === "undefined") {
      return false;
    }
    if (jwtPayload.iss !== Common.constants.bridge.jwt.iss) {
      return false;
    }
    if (typeof jwtPayload.sub === "undefined") {
      return false;
    }
    const authorizedEmails = await that._configuration.authorizedEmails();
    const found = authorizedEmails.find(
      (authorizedEmail) => jwtPayload.sub === authorizedEmail
    );

    if (typeof found === "undefined") {
      return false;
    }
    if (typeof jwtPayload.aud === "undefined") {
      return false;
    }
    const hostname = that._configuration.hostname();
    if (
      jwtPayload.aud !==
      `https://${hostname}${Common.constants.bridge.path.skill}`
    ) {
      return false;
    }

    return true;
  }

  public generateBridgeToken(): string {
    return crypto.randomBytes(512).toString("base64").slice(0, 256);
  }

  public async setBridgeToken(
    email: string,
    hostname: string,
    bridgeToken: string
  ): Promise<void> {
    await this._db.updateOrInsertRecord(
      { email },
      { email, hostname, bridgeToken }
    );
  }

  public async authorizeBridgeToken(bridgeToken: string): Promise<boolean> {
    const record = await this._db.getRecord({ bridgeToken });
    if (record === null) {
      return false;
    }
    if (
      typeof record.email !== "string" ||
      typeof record.hostname !== "string"
    ) {
      await this._db.deleteRecord({ bridgeToken });
      return false;
    }

    const email = record.email;
    const hostname = record.hostname;

    // CHeck if the email is still authorized and delete the record if it is not.
    const authorizedEmails = await this._configuration.authorizedEmails();
    const found = authorizedEmails.find(
      (authorizedEmail) => email === authorizedEmail
    );
    if (typeof found === "undefined") {
      await this._db.deleteRecord({ bridgeToken });
      return false;
    }

    // Make sure the hostname is still authorized and delete the record if it is
    // not.
    const authorizedHostname = await this._configuration.hostname();
    if (hostname !== authorizedHostname) {
      await this._db.deleteRecord({ bridgeToken });
      return false;
    }

    return true;
  }
}
