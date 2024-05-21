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
  public readonly requestUrl?: string;
  public readonly requestMethod?: "GET" | "POST";
  public readonly requestHeaders?: Record<string, string>;
  public readonly requestBody?: object;
  public readonly responseStatusCode?: number;
  public readonly responseHeaders?: Headers;
  public readonly responseBody?: string | object;

  constructor(options: {
    code: HttpCommonErrorCode;
    message?: string;
    requestUrl?: string;
    requestMethod?: "GET" | "POST";
    requestHeaders?: Record<string, string>;
    requestBody?: object;
    responseStatusCode?: number;
    responseHeaders?: Headers;
    responseBody?: string | object;
    cause?: unknown;
  }) {
    super(options);
    this.name = "HttpCommonError";
    this.code = options.code;

    this.requestUrl = options.requestUrl;
    this.requestMethod = options.requestMethod;
    this.requestHeaders = options.requestHeaders;
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
 * received. Otherwise, this function throws a {@link HttpCommonError}.
 *
 * @param requestOptions - basic HTTP options.
 * @param bearerToken - the bearer token for authorizing the request with the
 * receiver.
 * @param requestBody - a JSON object containing the request message to be sent.
 * @returns a JSON object containing the response body.
 *
 * @throws a {@link HttpCommonError} with codes from
 * {@link HttpCommonErrorCode}.
 */
export async function request(
  requestOptions: RequestOptions,
  bearerToken: string,
  requestBody?: object,
): Promise<object> {
  const url: string = `https://${requestOptions.hostname}:${requestOptions.port}${requestOptions.path}`;
  const options: {
    method: "GET" | "POST";
    body?: string;
    headers: Record<string, string>;
  } = {
    method: "GET",
    headers: {
      authorization: `Bearer ${bearerToken}`,
      accept: "application/json",
    },
  };

  if (requestBody !== undefined) {
    const body = JSON.stringify(requestBody);
    options.method = "POST";
    options.headers["content-type"] = "application/json";
    options.headers["content-length"] = Buffer.byteLength(body).toString();
    options.body = body;
  }

  Debug.debug("HTTP Request");
  Debug.debugJSON(url);
  Debug.debugJSON(options);

  let response: Response | undefined;
  let data: string | undefined;
  let body: string | object | undefined;

  function createHttpError(
    code: HttpCommonErrorCode,
    cause?: unknown,
  ): HttpCommonError {
    return new HttpCommonError({
      code,
      requestUrl: url,
      requestMethod: options.method,
      requestHeaders: options.headers,
      requestBody,
      responseStatusCode: response?.status,
      responseHeaders: response?.headers,
      responseBody: body ?? data,
      cause,
    });
  }

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw createHttpError("unknown", error);
  }

  let blob: Blob;
  try {
    blob = await response.blob();
  } catch (error) {
    throw createHttpError("unknown", error);
  }

  const statusCode: number = response.status;
  const contentType: string = blob.type;

  if (statusCode === undefined) {
    throw createHttpError("statusCodeNotFound");
  }
  switch (statusCode) {
    case 400: {
      throw createHttpError("badRequest");
    }
    case 401: {
      throw createHttpError("unauthorized");
    }
    case 403: {
      throw createHttpError("forbidden");
    }
    case 500: {
      throw createHttpError("internalServerError");
    }
    case 502: {
      throw createHttpError("badGateway");
    }
  }

  if (contentType === undefined) {
    throw createHttpError("contentTypeNotFound");
  }

  if (
    contentType
      .split(/\s*;\s*/)[0]
      .trim()
      .toLowerCase() !== "application/json"
  ) {
    throw createHttpError("contentTypeValueInvalid", {
      contentType,
      contentTypeParsed: contentType.split(/\w*;\w*/).toString(),
    });
  }

  try {
    data = await blob.text();
  } catch (error) {
    throw createHttpError("bodyFormatInvalid", error);
  }

  try {
    const bodyUnknown: unknown = JSON.parse(data);
    if (typeof bodyUnknown !== "object" || bodyUnknown === null) {
      throw createHttpError("bodyNotFound");
    }
    body = bodyUnknown;
  } catch (error) {
    Debug.debugError(error);
    throw createHttpError("bodyFormatInvalid");
  }

  return body;
}
