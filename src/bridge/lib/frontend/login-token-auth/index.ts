import * as fs from "fs";
import * as path from "path";
import { JwtPayload } from "jsonwebtoken";
import * as Common from "../../../../common";
import { Configuration } from "../../configuration";

export class LoginTokenAuth {
  private readonly _configuration: Configuration;
  private readonly _x509PublicCert: Buffer;
  private constructor(_configuration: Configuration, _x509PublicCert: Buffer) {
    this._configuration = _configuration;
    this._x509PublicCert = _x509PublicCert;
  }

  public static async build(
    configuration: Configuration,
  ): Promise<LoginTokenAuth> {
    const _x509PublicCert = fs.readFileSync(
      path.join(__dirname, Common.constants.bridge.jwt.x509PublicCertFile),
    );

    const loginTokenAuth = new LoginTokenAuth(configuration, _x509PublicCert);

    return loginTokenAuth;
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
      (authorizedEmail) => jwtPayload.sub === authorizedEmail,
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
}
