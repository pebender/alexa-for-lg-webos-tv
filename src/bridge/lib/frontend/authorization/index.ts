import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { JwtPayload } from "jsonwebtoken";
import * as Common from "../../../../common";
import { BaseClass } from "../../base-class";
import { DatabaseRecord, DatabaseTable } from "../../database";
import { Configuration } from "../../configuration";

export class Authorization extends BaseClass {
  private readonly _configuration: Configuration;
  private readonly _x509PublicCert: Buffer;
  private readonly _db: DatabaseTable;
  public constructor(configuration: Configuration) {
    super();

    this._configuration = configuration;
    this._x509PublicCert = fs.readFileSync(
      path.join(__dirname, Common.constants.bridge.jwt.x509PublicCertFile)
    );
    this._db = new DatabaseTable(
      "frontend",
      ["email", "hostname", "bridgeToken"],
      "email"
    );
  }

  public initialize(): Promise<void> {
    const that = this;

    async function initializeFunction(): Promise<void> {
      await that._db.initialize();
    }
    return this.initializeHandler(initializeFunction);
  }

  public x509PublicCert(): Buffer {
    return this._x509PublicCert;
  }

  public async authorizeJwTPayload(jwtPayload: JwtPayload): Promise<boolean> {
    const that = this;

    Common.Debug.debug("authorizeJwTPayload:");
    Common.Debug.debugJSON(jwtPayload);
    if (typeof jwtPayload.iss === "undefined") {
      Common.Debug.debug("jwtPayload.iss failed: missing");
      return false;
    }
    if (jwtPayload.iss !== Common.constants.bridge.jwt.iss) {
      Common.Debug.debug(
        `jwtPayload.iss failed: ${jwtPayload.iss} ${Common.constants.bridge.jwt.iss}`
      );
      return false;
    }
    if (typeof jwtPayload.sub === "undefined") {
      Common.Debug.debug("jwtPayload.sub failed: missing");
      return false;
    }
    let found;
    try {
      const authorizedEmails = await that._configuration.authorizedEmails();
      found = authorizedEmails.find(
        (authorizedEmail) => jwtPayload.sub === authorizedEmail
      );
    } catch (error) {
      Common.Debug.debugError(error);
      throw error;
    }
    if (typeof found === "undefined") {
      Common.Debug.debug("jwtPayload.sub failed");
      return false;
    }
    if (typeof jwtPayload.aud === "undefined") {
      Common.Debug.debug("jwtPayload.aud failed: missing");
      return false;
    }
    try {
      const hostname = that._configuration.hostname();
      if (
        jwtPayload.aud !==
        `https://${hostname}${Common.constants.bridge.path.skill}`
      ) {
        Common.Debug.debug(
          `jwtPayload.sub failed ${jwtPayload.aud} https://${hostname}${Common.constants.bridge.path.skill}`
        );
        return false;
      }
    } catch (error) {
      Common.Debug.debugError(error);
      throw error;
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
    try {
      await this._db.updateOrInsertRecord(
        { email },
        { email, hostname, bridgeToken }
      );
    } catch (error) {
      throw Common.SHS.Error.errorResponseFromError(null, error);
    }
  }

  public async authorizeBridgeToken(bridgeToken: string): Promise<boolean> {
    let record: DatabaseRecord | null;
    try {
      record = await this._db.getRecord({ bridgeToken });
    } catch (error) {
      Common.Debug.debugError(error);
      throw Common.SHS.Error.errorResponseFromError(null, error);
    }
    if (record === null) {
      return false;
    }
    if (
      typeof record.email !== "string" ||
      typeof record.hostname !== "string"
    ) {
      try {
        await this._db.deleteRecord({ bridgeToken });
      } catch (error) {
        Common.Debug.debugError(error);
        throw Common.SHS.Error.errorResponseFromError(null, error);
      }
      return false;
    }

    const email = record.email;
    const hostname = record.hostname;

    // CHeck if the email is still authorized and delete the record if it is not.
    try {
      const authorizedEmails = await this._configuration.authorizedEmails();
      const found = authorizedEmails.find(
        (authorizedEmail) => email === authorizedEmail
      );
      if (typeof found === "undefined") {
        try {
          await this._db.deleteRecord({ bridgeToken });
        } catch (error) {
          Common.Debug.debugError(error);
          throw Common.SHS.Error.errorResponseFromError(null, error);
        }
        return false;
      }
    } catch (error) {
      Common.Debug.debugError(error);
      throw error;
    }

    // Make sure the hostname is still authorized and delete the record if it is
    // not.
    try {
      const authorizedHostname = await this._configuration.hostname();
      if (hostname !== authorizedHostname) {
        try {
          await this._db.deleteRecord({ bridgeToken });
        } catch (error) {
          Common.Debug.debugError(error);
          throw Common.SHS.Error.errorResponseFromError(null, error);
        }
        return false;
      }
    } catch (error) {
      Common.Debug.debugError(error);
      throw error;
    }

    return true;
  }
}
