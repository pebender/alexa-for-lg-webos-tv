import * as fs from "node:fs";
import path from "node:path";
import * as jose from "jose-node-cjs-runtime";
import * as Common from "../../../common";
import type { Credentials } from "./credentials";
import type { UserAuth } from "./user-auth";
import type { TokenAuth } from "./token-auth";

export class LoginTokenAuth implements TokenAuth {
  private readonly _userAuth: UserAuth;
  private readonly _x509PublicCert: string;
  private constructor(_userAuth: UserAuth, _x509PublicCert: string) {
    this._userAuth = _userAuth;
    this._x509PublicCert = _x509PublicCert;
  }

  public static build(userAuth: UserAuth): LoginTokenAuth {
    const _x509PublicCert: string = fs.readFileSync(
      path.join(__dirname, Common.constants.bridge.jwt.x509PublicCertFile),
      "ascii",
    );

    const loginTokenAuth = new LoginTokenAuth(userAuth, _x509PublicCert);

    return loginTokenAuth;
  }

  public async authorize(loginToken: string): Promise<Credentials | null> {
    let publicKey: jose.KeyLike;
    try {
      publicKey = await jose.importX509(this._x509PublicCert, "EdDSA");
    } catch (error) {
      Common.Debug.debugError(error);
      return null;
    }

    let payload: jose.JWTPayload;
    try {
      const result: jose.JWTVerifyResult = await jose.jwtVerify(
        loginToken,
        publicKey,
        { algorithms: ["EdDSA"] },
      );
      payload = result.payload;
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
    const bridgeHostname: string = url.hostname;

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

    const authorized = this._userAuth.authorizeUser(bridgeHostname, email);
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
