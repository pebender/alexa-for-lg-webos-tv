import * as https from "node:https";
import * as Debug from "./debug";
import * as CommonError from "./error";

export type RequestOptions = {
  hostname: string;
  port: number;
  path: string;
  method: "GET" | "POST";
  headers: { [x: string]: string };
};

type ResponseErrorNames =
  | "CONNECTION_INTERRUPTED"
  | "STATUS_CODE_MISSING"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR"
  | "BAD_GATEWAY"
  | "CONTENT_TYPE_MISSING"
  | "CONTENT_TYPE_INCORRECT"
  | "BODY_MISSING"
  | "BODY_INVALID_FORMAT"
  | "UNKNOWN_ERROR";

function createHttpError(
  specific: ResponseErrorNames,
): CommonError.AlexaForLGwebOSTVError {
  const general = "http";
  return CommonError.create("", { general, specific });
}

export async function request(
  requestOptions: RequestOptions,
  bearerToken: string,
  requestBody?: object,
): Promise<any> {
  const content = JSON.stringify(requestBody);
  const options: RequestOptions = {
    hostname: requestOptions.hostname,
    port: requestOptions.port,
    path: requestOptions.path,
    method: requestOptions.method,
    headers: {},
  };

  Object.assign(options.headers, requestOptions.headers);
  options.headers.authorization = `Bearer ${bearerToken}`;
  options.headers["content-type"] = "application/json";
  if (requestOptions.method === "POST") {
    options.headers["content-length"] = Buffer.byteLength(content).toString();
  }

  Debug.debug("HTTP Request");
  Debug.debugJSON(options);
  Debug.debugJSON(content);

  let body: object;
  let data = "";
  const response = new Promise((resolve, reject): void => {
    const req = https.request(options, (res): void => {
      res.setEncoding("utf8");
      res.on("data", (chunk: string): void => {
        data += chunk;
      });
      res.on("end", (): void => {
        if (!res.complete) {
          reject(createHttpError("CONNECTION_INTERRUPTED"));
        }

        Debug.debug("HTTP Response");
        Debug.debug(res.statusCode);
        Debug.debugJSON(res.headers);
        Debug.debugJSON(data);

        const statusCode = res.statusCode;
        const contentType = res.headers["content-type"];

        if (typeof statusCode === "undefined") {
          reject(createHttpError("STATUS_CODE_MISSING"));
        }
        switch (statusCode) {
          case 400: {
            reject(createHttpError("BAD_REQUEST"));
            break;
          }
          case 401: {
            reject(createHttpError("UNAUTHORIZED"));
            break;
          }
          case 403: {
            reject(createHttpError("FORBIDDEN"));
            break;
          }
          case 500: {
            reject(createHttpError("INTERNAL_SERVER_ERROR"));
            break;
          }
          case 502: {
            reject(createHttpError("BAD_GATEWAY"));
            break;
          }
        }

        if (typeof contentType === "undefined") {
          reject(createHttpError("CONTENT_TYPE_MISSING"));
        }

        if (!/^application\/json/.test((contentType as string).toLowerCase())) {
          reject(createHttpError("CONTENT_TYPE_INCORRECT"));
        }

        try {
          body = JSON.parse(data);
        } catch (cause) {
          reject(createHttpError("BODY_INVALID_FORMAT"));
        }
        // Return the body.
        resolve(body);
      });
    });
    req.on("error", (): void => {
      reject(createHttpError("UNKNOWN_ERROR"));
    });
    if (requestOptions.method === "POST") {
      req.write(content);
    }
    req.end();
  });

  return await response;
}
