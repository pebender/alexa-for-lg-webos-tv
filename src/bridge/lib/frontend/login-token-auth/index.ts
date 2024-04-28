import * as fs from "fs";
import * as path from "path";
import { JwtPayload } from "jsonwebtoken";
import * as Common from "../../../../common";
import { Configuration } from "../../configuration";
import { AuthorizationHandler } from "../auth";

export class LoginTokenAuth {
  private readonly _configuration: Configuration;
  private readonly _authorizationHandler: AuthorizationHandler;
  private readonly _x509PublicCert: Buffer;
  private constructor(
    _configuration: Configuration,
    _authorizationHandler: AuthorizationHandler,
    _x509PublicCert: Buffer,
  ) {
    this._configuration = _configuration;
    this._authorizationHandler = _authorizationHandler;
    this._x509PublicCert = _x509PublicCert;
  }

  public static async build(
    configuration: Configuration,
    authorizationHandler: AuthorizationHandler,
  ): Promise<LoginTokenAuth> {
    const _x509PublicCert = fs.readFileSync(
      path.join(__dirname, Common.constants.bridge.jwt.x509PublicCertFile),
    );

    const loginTokenAuth = new LoginTokenAuth(
      configuration,
      authorizationHandler,
      _x509PublicCert,
    );

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
    const url = new URL(jwtPayload.aud);
    const hostname = url.hostname;
    const service = url.pathname;

    if (iss !== Common.constants.bridge.jwt.iss) {
      return false;
    }

    if (hostname !== (await that._configuration.hostname())) {
      return false;
    }

    const authorized = await that._authorizationHandler(
      that._configuration,
      service,
      user,
    );
    if (authorized === false) {
      return false;
    }

    return true;
  }
}
