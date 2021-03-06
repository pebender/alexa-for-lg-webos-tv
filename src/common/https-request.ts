import https from "https";
import * as Debug from "./debug";

export type RequestOptions = {
  hostname: string;
  port: number;
  path: string;
  method: "GET" | "POST";
  headers: { [x: string]: string };
};

export type ResponseErrorNames =
  | "CONNECTION_INTERRUPTED"
  | "STATUS_CODE_MISSING"
  | "INVALID_AUTHORIZATION_CREDENTIAL"
  | "INTERNAL_ERROR"
  | "CONTENT_TYPE_MISSING"
  | "CONTENT_TYPE_INCORRECT"
  | "BODY_MISSING"
  | "BODY_INVALID_FORMAT"
  | "UNKNOWN_ERROR"
  | "BAD_GATEWAY";

export type ResponseError = {
  name: ResponseErrorNames;
  body?: object;
  stack?: string;
  error?: Error;
  http?: {
    statusCode?: number;
    contentType?: string;
    body?: string | object;
  };
};

export async function request(
  requestOptions: RequestOptions,
  bearerToken: string,
  requestBody?: object
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
          const responseError: ResponseError = {
            name: "CONNECTION_INTERRUPTED",
          };
          Error.captureStackTrace(responseError);
          reject(responseError);
        }

        Debug.debug("HTTP Response");
        Debug.debug(res.statusCode);
        Debug.debugJSON(res.headers);
        Debug.debugJSON(data);

        const statusCode = res.statusCode;
        const contentType = res.headers["content-type"];

        if (typeof statusCode === "undefined") {
          const responseError: ResponseError = {
            name: "STATUS_CODE_MISSING",
          };
          Error.captureStackTrace(responseError);
          reject(responseError);
        }
        switch (statusCode) {
          case 401: {
            const responseError: ResponseError = {
              name: "INVALID_AUTHORIZATION_CREDENTIAL",
              http: {
                statusCode,
              },
            };
            Error.captureStackTrace(responseError);
            reject(responseError);
            break;
          }
          case 403: {
            const responseError: ResponseError = {
              name: "INVALID_AUTHORIZATION_CREDENTIAL",
              http: {
                statusCode,
              },
            };
            Error.captureStackTrace(responseError);
            reject(responseError);
            break;
          }
          case 500: {
            const responseError: ResponseError = {
              name: "INTERNAL_ERROR",
              http: {
                statusCode,
              },
            };
            Error.captureStackTrace(responseError);
            reject(responseError);
            break;
          }
          case 502: {
            const responseError: ResponseError = {
              name: "BAD_GATEWAY",
              http: {
                statusCode,
              },
            };
            Error.captureStackTrace(responseError);
            reject(responseError);
            break;
          }
        }

        if (typeof contentType === "undefined") {
          const responseError: ResponseError = {
            name: "CONTENT_TYPE_MISSING",
            http: {
              statusCode,
            },
          };
          Error.captureStackTrace(responseError);
          reject(responseError);
        }

        if (!/^application\/json/.test((contentType as string).toLowerCase())) {
          const responseError: ResponseError = {
            name: "CONTENT_TYPE_INCORRECT",
            http: {
              statusCode,
              contentType,
            },
          };
          Error.captureStackTrace(responseError);
          reject(responseError);
        }

        try {
          body = JSON.parse(data);
        } catch (error: any) {
          const name = error.name
            ? error.name
            : error.code
            ? error.code
            : "unknown";
          const message = error.message ? error.message : "unknown";
          const responseErrorError = new Error(message);
          responseErrorError.name = name;
          const responseError: ResponseError = {
            name: "UNKNOWN_ERROR",
            error: responseErrorError,
          };
          reject(responseError);
        }
        // Return the body.
        resolve(body);
      });
    });
    req.on("error", (error: Error): void => {
      Debug.debug("HTTP Error");
      Debug.debugError(error);
      const name = error.name ? error.name : "unknown";
      const message = error.message;
      const responseErrorError = new Error(message);
      responseErrorError.name = name;
      const responseError: ResponseError = {
        name: "UNKNOWN_ERROR",
        error: responseErrorError,
      };
      reject(responseError);
    });
    if (requestOptions.method === "POST") {
      req.write(content);
    }
    req.end();
  });

  return await response;
}
