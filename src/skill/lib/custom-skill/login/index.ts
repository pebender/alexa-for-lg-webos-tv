import * as Common from "../../../../common";
import * as fs from "fs";
import * as path from "path";
import jwt from "jsonwebtoken";

const x509PrivateKey = fs.readFileSync(
  path.join(__dirname, Common.constants.bridge.jwt.x509PrivateKeyFile)
);

function create(
  x509PrivateKey: Buffer,
  email: string,
  hostname: string
): Promise<string> {
  const payload: jwt.JwtPayload = {
    iss: Common.constants.bridge.jwt.iss,
    sub: email,
    aud: `https://${hostname}${Common.constants.bridge.path.skill}`,
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
          reject(new Error());
        }
      } else {
        reject(err);
      }
    });
  });
}

export async function getBridgeToken(
  email: string,
  hostname: string
): Promise<Common.SHS.Response> {
  const requestOptions: Common.HTTPSRequest.RequestOptions = {
    hostname,
    path: Common.constants.bridge.path.login,
    port: Common.constants.bridge.port.https,
    method: "GET",
    headers: {},
  };

  const token = await create(x509PrivateKey, email, hostname);

  let response;
  try {
    response = await Common.HTTPSRequest.request(requestOptions, token);
  } catch (error) {
    const requestError = error as Common.HTTPSRequest.ResponseError;
    switch (requestError.name) {
      case "CONNECTION_INTERRUPTED":
        throw Error();
      case "STATUS_CODE_MISSING":
        throw Error();
      case "INVALID_AUTHORIZATION_CREDENTIAL":
        throw Error();
      case "INTERNAL_ERROR":
        throw Error();
      case "CONTENT_TYPE_MISSING":
        throw Error();
      case "CONTENT_TYPE_INCORRECT":
        throw Error();
      case "BODY_MISSING":
        throw Error();
      case "BODY_INVALID_FORMAT":
        throw Error();
      case "UNKNOWN_ERROR":
        throw Error();
      default:
        throw Error();
    }
  }

  if (typeof response !== "object") {
    throw Error();
  }

  if (typeof response.token !== "string") {
    throw Error();
  }

  return response.token;
}
