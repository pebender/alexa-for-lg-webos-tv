import * as Common from "../../../../common";
import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";

const x509PrivateKey = fs.readFileSync(
  path.join(__dirname, Common.constants.bridge.jwt.x509PrivateKeyFile),
);

function create(
  x509PrivateKey: Buffer,
  email: string,
  hostname: string,
): Promise<string> {
  const payload: jwt.JwtPayload = {
    iss: Common.constants.bridge.jwt.iss,
    sub: email,
    aud: `https://${hostname}${Common.constants.bridge.path.service}`,
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
          throw Common.Error.create("", { general: "unknown" });
        }
      } else {
        reject(Common.Error.create("", { general: "unknown", cause: err }));
      }
    });
  });
}

export async function getBridgeToken(
  skillToken: string,
  hostname: string,
): Promise<Common.SHS.Response> {
  const requestOptions: Common.HTTPSRequest.RequestOptions = {
    hostname,
    path: Common.constants.bridge.path.login,
    port: Common.constants.bridge.port.https,
    method: "GET",
    headers: {},
  };

  const token = await create(x509PrivateKey, skillToken, hostname);

  const response = await Common.HTTPSRequest.request(requestOptions, token);

  if (typeof response !== "object") {
    throw Common.Error.create("", { general: "unknown" });
  }

  if (typeof response.token !== "string") {
    throw Common.Error.create("", { general: "unknown" });
  }

  return response.token;
}
