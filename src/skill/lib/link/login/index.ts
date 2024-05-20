import * as fs from "node:fs";
import path from "node:path";
import * as jwt from "jsonwebtoken";
import * as Common from "../../../../common";

const x509PrivateKey = fs.readFileSync(
  path.join(__dirname, Common.constants.bridge.jwt.x509PrivateKeyFile),
);

async function create(
  x509PrivateKey: Buffer,
  skillToken: string,
  bridgeHostname: string,
): Promise<string> {
  const payload: jwt.JwtPayload = {
    iss: Common.constants.bridge.jwt.iss,
    sub: skillToken,
    aud: `https://${bridgeHostname}`,
  };
  const options: jwt.SignOptions = {
    algorithm: "RS256",
    expiresIn: "1m",
  };

  return await new Promise<string>((resolve, reject) => {
    jwt.sign(payload, x509PrivateKey, options, function (error, encoded) {
      if (error !== null) {
        reject(new Common.Error.GeneralCommonError({ cause: error }));
      }

      if (encoded === undefined) {
        throw new Common.Error.GeneralCommonError({
          message: "function API violation",
        });
      }

      resolve(encoded);
    });
  });
}

export async function getBridgeToken(
  skillToken: string,
  bridgeHostname: string,
): Promise<string> {
  const requestOptions: Common.HTTPSRequest.RequestOptions = {
    hostname: bridgeHostname,
    path: Common.constants.bridge.path.login,
    port: Common.constants.bridge.port.https,
    headers: {},
  };

  const token = await create(x509PrivateKey, skillToken, bridgeHostname);

  const response: { token?: string; [key: string]: unknown } =
    (await Common.HTTPSRequest.request(requestOptions, token, {})) as {
      token?: string;
      [key: string]: unknown;
    };

  if (response.token === undefined || typeof response.token !== "string") {
    throw new Common.Error.GeneralCommonError({});
  }

  return response.token;
}
