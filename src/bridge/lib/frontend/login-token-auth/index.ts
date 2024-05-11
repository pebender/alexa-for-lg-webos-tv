import * as fs from "fs";
import * as path from "path";
import { JwtPayload } from "jsonwebtoken";
import * as Common from "../../../../common";
import { Configuration } from "../../configuration";
import { authorizeUser } from "../auth";

export class LoginTokenAuth {
  private readonly _configuration: Configuration;
  private readonly _x509PublicCert: Buffer;
  private constructor(_configuration: Configuration, _x509PublicCert: Buffer) {
    this._configuration = _configuration;
    this._x509PublicCert = _x509PublicCert;
  }

  public static build(configuration: Configuration): LoginTokenAuth {
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
    if (typeof jwtPayload.iss === "undefined") {
      return false;
    }
    if (typeof jwtPayload.sub === "undefined") {
      return false;
    }
    if (typeof jwtPayload.aud === "undefined") {
      return false;
    }

    const iss = jwtPayload.iss;
    const skillToken = jwtPayload.sub;
    const url = new URL(jwtPayload.aud);
    const hostname = url.hostname;

    if (iss !== Common.constants.bridge.jwt.iss) {
      return false;
    }

    let email: string = "";
    try {
      email = await Common.Profile.getUserEmail(skillToken);
    } catch (error) {
      return false;
    }

    const authorized = await authorizeUser(
      this._configuration,
      hostname,
      email,
    );
    if (!authorized) {
      return false;
    }

    return true;
  }
}
