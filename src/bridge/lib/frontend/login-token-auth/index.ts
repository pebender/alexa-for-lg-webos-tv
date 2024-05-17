import * as fs from "node:fs";
import path from "node:path";
import * as jwt from "jsonwebtoken";
import * as Common from "../../../../common";
import type { Configuration } from "../../configuration";
import { authorizeUser } from "../auth";

export interface LoginTokenAuthRecord {
  bridgeHostname: string;
  email: string;
  userId: string;
  skillToken: string;
}

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

  public async authorizeLoginToken(
    loginToken: string,
  ): Promise<LoginTokenAuthRecord | null> {
    let decodedLoginToken: jwt.Jwt | null;
    try {
      decodedLoginToken = jwt.decode(loginToken, { complete: true });
    } catch (error) {
      Common.Debug.debugError(error);
      return null;
    }
    if (decodedLoginToken === null) {
      return null;
    }
    if (typeof decodedLoginToken.payload === "string") {
      return null;
    }
    const payload: jwt.JwtPayload = decodedLoginToken.payload;

    const verifyOptions: jwt.VerifyOptions = {
      algorithms: ["RS256"],
    };
    try {
      jwt.verify(loginToken, this._x509PublicCert, verifyOptions);
    } catch (error) {
      Common.Debug.debugError(error);
      return null;
    }

    if (
      typeof payload.sub !== "string" ||
      payload.iss !== Common.constants.bridge.jwt.iss
    ) {
      return null;
    }

    if (typeof payload.sub !== "string") {
      return null;
    }
    const skillToken = payload.sub;

    if (typeof payload.aud !== "string") {
      return null;
    }
    const url = new URL(payload.aud);
    const bridgeHostname = url.hostname;

    let userId: string;
    let email: string;
    try {
      const userProfile: Common.Profile.UserProfile =
        await Common.Profile.getUserProfile(skillToken);
      userId = userProfile.userId;
      email = userProfile.email;
    } catch (error) {
      Common.Debug.debugError(error);
      return null;
    }

    const authorized = authorizeUser(
      this._configuration,
      bridgeHostname,
      email,
    );
    if (!authorized) {
      return null;
    }

    return {
      bridgeHostname,
      userId,
      email,
      skillToken,
    };
  }
}
