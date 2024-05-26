import * as fs from "node:fs";
import path from "node:path";
import * as jose from "jose-node-cjs-runtime";
import * as Common from "../../../common";
import { HTTPSRequest, LinkCommonError } from "./index";

const x509PrivateKeyFile: string = fs.readFileSync(
  path.join(__dirname, Common.constants.bridge.jwt.x509PrivateKeyFile),
  "ascii",
);

async function getLoginToken(
  x509PrivateKey: string,
  skillToken: string,
  bridgeHostname: string,
): Promise<string> {
  let loginToken: string;
  let privateKey: jose.KeyLike;
  try {
    privateKey = await jose.importPKCS8(x509PrivateKey, "EdDSA");
  } catch (error) {
    throw new LinkCommonError({ cause: error });
  }
  try {
    loginToken = await new jose.SignJWT()
      .setProtectedHeader({
        alg: "EdDSA",
      })
      .setIssuedAt()
      .setIssuer(Common.constants.bridge.jwt.iss)
      .setSubject(skillToken)
      .setAudience(`https://${bridgeHostname}`)
      .setExpirationTime("1 min")
      .sign(privateKey);
  } catch (error) {
    throw new LinkCommonError({ cause: error });
  }
  return loginToken;
}

export async function getBridgeToken(
  skillToken: string,
  bridgeHostname: string,
): Promise<string> {
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname: bridgeHostname,
    path: Common.constants.bridge.path.login,
    port: Common.constants.bridge.port.https,
    headers: {},
  };

  const loginToken = await getLoginToken(
    x509PrivateKeyFile,
    skillToken,
    bridgeHostname,
  );

  const response: { token?: string; [key: string]: unknown } =
    (await HTTPSRequest.request(requestOptions, loginToken, {})) as {
      token?: string;
      [key: string]: unknown;
    };

  if (response.token === undefined || typeof response.token !== "string") {
    throw new Common.GeneralCommonError({});
  }

  return response.token;
}
