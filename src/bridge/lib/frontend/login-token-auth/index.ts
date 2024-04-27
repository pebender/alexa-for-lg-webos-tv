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
    if (typeof jwtPayload.sub === "undefined") {
      return false;
    }
    if (typeof jwtPayload.aud === "undefined") {
      return false;
    }

    const iss = jwtPayload.iss;
    const user = jwtPayload.sub;
    const service = jwtPayload.aud;

    if (iss !== Common.constants.bridge.jwt.iss) {
      return false;
    }

    const hostname = that._configuration.hostname();
    const authorizedServicesAndUsers =
      await this._configuration.authorizedServicesAndUsers();
    const authorizedService = authorizedServicesAndUsers.find(
      (authorizedService) =>
        service === `https://${hostname}${authorizedService.service}`,
    );
    if (typeof authorizedService === "undefined") {
      return false;
    }
    const authorizedUsers = authorizedService.users;
    const authorizedUser = authorizedUsers.find(
      (authorizedUser) => user === authorizedUser,
    );
    if (typeof authorizedUser === "undefined") {
      return false;
    }

    return true;
  }
}
