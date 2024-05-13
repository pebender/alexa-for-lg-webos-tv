import * as Common from "../../../../common";
import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";

const x509PrivateKey = fs.readFileSync(
  path.join(__dirname, Common.constants.bridge.jwt.x509PrivateKeyFile),
);

function create(
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

  return new Promise((resolve, reject) => {
    jwt.sign(payload, x509PrivateKey, options, function (err, encoded) {
      if (err === null) {
        if (typeof encoded !== "undefined") {
          resolve(encoded);
        } else {
          throw Common.Error.create({ general: "unknown" });
        }
      } else {
        reject(Common.Error.create({ general: "unknown", cause: err }));
      }
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
    (await Common.HTTPSRequest.request(requestOptions, token)) as {
      token?: string;
      [key: string]: unknown;
    };

  if (
    typeof response.token === "undefined" ||
    typeof response.token !== "string"
  ) {
    throw Common.Error.create({ general: "unknown" });
  }

  return response.token;
}
