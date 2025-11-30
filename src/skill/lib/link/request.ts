import * as Common from "../../../common";
import { LinkCommonError, type LinkCommonErrorCode } from "./link-common-error";
import { HttpCommonError, type HttpCommonErrorCode } from "./http-common-error";

export interface RequestOptions {
  hostname: string;
  port: number;
  path: string;
  headers: Record<string, string>;
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
  const url = `https://${requestOptions.hostname}:${requestOptions.port}${requestOptions.path}`;
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

  Common.Debug.debug("HTTP Request");
  Common.Debug.debugJSON(url);
  Common.Debug.debugJSON(options);

  let response: Response | undefined = undefined;
  let responseBody: string | object | undefined = undefined;

  function createError(
    code: HttpCommonErrorCode,
    cause?: unknown,
  ): LinkCommonError {
    const httpCommonError = new HttpCommonError({
      code,
      requestUrl: url,
      requestMethod: options.method,
      requestHeaders: options.headers,
      requestBody,
      responseStatusCode: response?.status,
      responseHeaders: response?.headers,
      responseBody,
      cause,
    });
    let linkCommonErrorCode: LinkCommonErrorCode = "unknown";
    switch (code) {
      case "unauthorized": {
        linkCommonErrorCode = "authorizationFailed";
        break;
      }
      default: {
        linkCommonErrorCode = "unknown";
        break;
      }
    }
    return new LinkCommonError({
      code: linkCommonErrorCode,
      cause: httpCommonError,
    });
  }

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw createError("unknown", error);
  }

  if (!response.ok) {
    const statusCode: number = response.status;
    if (statusCode === undefined) {
      throw createError("statusCodeNotFound");
    }
    switch (statusCode) {
      case 400: {
        throw createError("badRequest");
      }
      case 401: {
        throw createError("unauthorized");
      }
      case 403: {
        throw createError("forbidden");
      }
      case 500: {
        throw createError("internalServerError");
      }
      case 502: {
        throw createError("badGateway");
      }
      default: {
        throw createError("unknown");
      }
    }
  }

  const contentType: string | null = response.headers.get("content-type");
  if (contentType === null) {
    throw createError("contentTypeNotFound");
  }
  const mimeType: string = contentType
    .split(/\s*;\s*/)[0]
    .trim()
    .toLowerCase();
  if (mimeType !== "application/json") {
    throw createError("contentTypeValueInvalid");
  }

  try {
    const responseBodyUnknown: unknown = response.json();
    /*
     * application/json is either an Array ([]) or an Object ({}) both of which
     * are typeof object.
     */
    if (
      typeof responseBodyUnknown !== "object" ||
      responseBodyUnknown === null
    ) {
      throw createError("bodyFormatInvalid");
    }
    responseBody = responseBodyUnknown;
  } catch (error) {
    throw createError("bodyFormatInvalid", error);
  }

  return responseBody;
}
