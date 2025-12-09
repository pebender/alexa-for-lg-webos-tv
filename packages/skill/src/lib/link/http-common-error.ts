import * as Common from "@backinthirty/alexa-for-lg-webos-tv-common";

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
 * A {@link Common.CommonError | CommonError} subclass for HTTP related
 * errors. The supported errors are given by {@link HttpCommonErrorCode}.
 */
export class HttpCommonError extends Common.CommonError {
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
