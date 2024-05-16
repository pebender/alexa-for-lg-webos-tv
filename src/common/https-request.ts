import * as https from "node:https";
import * as Debug from "./debug";
import * as CommonError from "./error";

export interface RequestOptions {
  hostname: string;
  port: number;
  path: string;
  headers: Record<string, string>;
}

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
  cause?: unknown,
): CommonError.CommonError {
  const general = "http";
  return CommonError.create({ general, specific, cause });
}

/**
 *
 * This function makes the HTTPS request specified by {@link requestOptions}.
 * The HTTPS request authenticates itself to the receiver by including
 * {@link bearerToken} as the bearer token in the HTTP authorization header. If
 * {@link requestBody} is provided, then the request is made using the HTTP
 * request method "POST" and includes requestBody as "application/json".
 * Otherwise, the request is made using the HTTP request method "GET". If the
 * request is successful, this function returns the JSON formatted response
 * received. Otherwise, this function throws a {@link CommonError.CommonError}.
 *
 * @param requestOptions - basic HTTP options.
 * @param bearerToken - the bearer token for authorizing the request with the
 * receiver.
 * @param requestBody - a JSON object containing the request message to be sent.
 * @returns a JSON object containing the response body.
 *
 * @throws a {@link CommonError.CommonError} with general="http" and specific from
 * {@link ResponseErrorNames}.
 */
export async function request(
  requestOptions: RequestOptions,
  bearerToken: string,
  requestBody?: object,
): Promise<object> {
  const content = requestBody === undefined ? "" : JSON.stringify(requestBody);
  const options: {
    hostname: string;
    port: number;
    path: string;
    method: string;
    headers: Record<string, string>;
  } = {
    hostname: requestOptions.hostname,
    port: requestOptions.port,
    path: requestOptions.path,
    method: requestBody === undefined ? "GET" : "POST",
    headers: {},
  };

  Object.assign(options.headers, requestOptions.headers);
  options.headers.authorization = `Bearer ${bearerToken}`;
  // eslint-disable-next-line @typescript-eslint/dot-notation
  options.headers["Accept"] = "application/json";
  if (options.method === "POST") {
    options.headers["content-type"] = "application/json";
    options.headers["content-length"] = Buffer.byteLength(content).toString();
  }

  Debug.debug("HTTP Request");
  Debug.debugJSON(options);
  Debug.debugJSON(content);

  let body: object;
  let data = "";
  const response = new Promise(
    (
      resolve: (value: object) => void,
      reject: (error: CommonError.CommonError) => void,
    ): void => {
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

          if (statusCode === undefined) {
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

          if (contentType === undefined) {
            reject(createHttpError("CONTENT_TYPE_MISSING"));
            return;
          }

          if (
            contentType
              .split(/\s*;\s*/)[0]
              .trim()
              .toLowerCase() !== "application/json"
          ) {
            reject(
              createHttpError("CONTENT_TYPE_INCORRECT", {
                contentType,
                contentTypeParsed: contentType.split(/\w*;\w*/).toString(),
              }),
            );
            return;
          }

          try {
            const bodyUnknown: unknown = JSON.parse(data);
            if (typeof bodyUnknown !== "object" || bodyUnknown === null) {
              reject(createHttpError("BODY_INVALID_FORMAT"));
              return;
            }
            body = bodyUnknown;
          } catch (cause) {
            reject(createHttpError("BODY_INVALID_FORMAT"));
            return;
          }
          // Return the body.
          resolve(body);
        });
      });
      req.on("error", (): void => {
        reject(createHttpError("UNKNOWN_ERROR"));
      });
      if (options.method === "POST") {
        req.write(content);
      }
      req.end();
    },
  );

  return await response;
}
