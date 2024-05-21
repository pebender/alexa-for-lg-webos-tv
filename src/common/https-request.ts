import type * as http from "node:http";
import * as https from "node:https";
import * as Debug from "./debug";
import * as CommonError from "./error";

export interface RequestOptions {
  hostname: string;
  port: number;
  path: string;
  headers: Record<string, string>;
}

export type HttpCommonErrorCode =
  | "badGateway"
  | "badRequest"
  | "bodyFormatInvalid"
  | "bodyNotFound"
  | "connectionInterrupted"
  | "contentTypeNotFound"
  | "contentTypeValueInvalid"
  | "forbidden"
  | "internalServerError"
  | "statusCodeNotFound"
  | "unauthorized"
  | "unknown";

/**
 * A {@link CommonError.CommonError | CommonError} subclass for HTTP related
 * errors. The supported errors are given by {@link HttpCommonErrorCode}.
 */
export class HttpCommonError extends CommonError.CommonError {
  public readonly code: HttpCommonErrorCode;
  public readonly requestOptions?: https.RequestOptions;
  public readonly requestBody?: object;
  public readonly responseStatusCode?: number;
  public readonly responseHeaders?: http.IncomingHttpHeaders;
  public readonly responseBody?: string | object;

  constructor(options: {
    code: HttpCommonErrorCode;
    message?: string;
    requestOptions?: https.RequestOptions;
    requestBody?: object;
    responseStatusCode?: number;
    responseHeaders?: http.IncomingHttpHeaders;
    responseBody?: string | object;
    cause?: unknown;
  }) {
    super(options);
    this.name = "HttpCommonError";
    this.code = options.code;
    this.requestOptions = options.requestOptions;
    this.requestBody = options.requestBody;
    this.responseStatusCode = options.responseStatusCode;
    this.responseHeaders = options.responseHeaders;
    this.responseBody = options.responseBody;
  }
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
 * received. Otherwise, this function throws a
 * {@link CommonError.HttpCommonError | HttpCommonError}.
 *
 * @param requestOptions - basic HTTP options.
 * @param bearerToken - the bearer token for authorizing the request with the
 * receiver.
 * @param requestBody - a JSON object containing the request message to be sent.
 * @returns a JSON object containing the response body.
 *
 * @throws a {@link CommonError.HttpCommonError | HttpCommonError} with codes
 * from {@link CommonError.HttpCommonErrorCode | HttpCommonErrorCode}.
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
      const request = https.request(options, (response): void => {
        response.setEncoding("utf8");
        response.on("data", (chunk: string): void => {
          data += chunk;
        });
        response.on("end", (): void => {
          function createHttpError(
            code: HttpCommonErrorCode,
            cause?: unknown,
          ): HttpCommonError {
            return new HttpCommonError({
              code,
              requestOptions: options,
              requestBody,
              responseStatusCode: response.statusCode,
              responseHeaders: response.headers,
              responseBody: data,
              cause,
            });
          }

          if (!response.complete) {
            reject(
              new HttpCommonError({
                code: "connectionInterrupted",
                requestOptions: options,
                requestBody,
              }),
            );
          }

          Debug.debug("HTTP Response");
          Debug.debug(response.statusCode);
          Debug.debugJSON(response.headers);
          Debug.debugJSON(data);

          const statusCode = response.statusCode;
          const contentType = response.headers["content-type"];

          if (statusCode === undefined) {
            reject(createHttpError("statusCodeNotFound"));
          }
          switch (statusCode) {
            case 400: {
              reject(createHttpError("badRequest"));
              break;
            }
            case 401: {
              reject(createHttpError("unauthorized"));
              break;
            }
            case 403: {
              reject(createHttpError("forbidden"));
              break;
            }
            case 500: {
              reject(createHttpError("internalServerError"));
              break;
            }
            case 502: {
              reject(createHttpError("badGateway"));
              break;
            }
          }

          if (contentType === undefined) {
            reject(createHttpError("contentTypeNotFound"));
            return;
          }

          if (
            contentType
              .split(/\s*;\s*/)[0]
              .trim()
              .toLowerCase() !== "application/json"
          ) {
            reject(
              createHttpError("contentTypeValueInvalid", {
                contentType,
                contentTypeParsed: contentType.split(/\w*;\w*/).toString(),
              }),
            );
            return;
          }

          try {
            const bodyUnknown: unknown = JSON.parse(data);
            if (typeof bodyUnknown !== "object" || bodyUnknown === null) {
              reject(createHttpError("bodyNotFound"));
              return;
            }
            body = bodyUnknown;
          } catch (error) {
            Debug.debugError(error);
            reject(createHttpError("bodyFormatInvalid"));
            return;
          }
          // Return the body.
          resolve(body);
        });
      });
      request.on("error", (error): void => {
        reject(
          new HttpCommonError({
            code: "unknown",
            requestOptions: options,
            requestBody,
            cause: error,
          }),
        );
      });
      if (options.method === "POST") {
        request.write(content);
      }
      request.end();
    },
  );

  return await response;
}
