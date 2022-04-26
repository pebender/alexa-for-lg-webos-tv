import * as Debug from "../debug";
import { SHSRequest } from "./request";
import { SHSResponse } from "./response";

export class SHSError {
  public response: SHSResponse;
  public httpStatusCode?: number;
  public stack?: string;

  constructor(
    request: any,
    httpStatusCode: number | null,
    type: string,
    message: string
  ) {
    if (httpStatusCode !== null) {
      this.httpStatusCode = httpStatusCode;
    }
    if (request !== null) {
      this.response = new SHSResponse({
        namespace: "Alexa",
        name: "ErrorResponse",
        endpointId: request.getEndpointId(),
        payload: {
          type,
          message,
        },
      });
    } else {
      this.response = new SHSResponse({
        namespace: "Alexa",
        name: "ErrorResponse",
        payload: {
          type,
          message,
        },
      });
    }
    Error.captureStackTrace(this);

    Debug.debug(`error: ${message} (${type}).`);
    Debug.debugJSON(this.response);
    Debug.debug(this.stack);
  }
}

export namespace SHSError {
  export function errorResponse(
    request: SHSRequest | null,
    httpStatusCode: number | null,
    type: string,
    message: string
  ): SHSError {
    return new SHSError(request, httpStatusCode, type, message);
  }

  export function errorResponseFromError(
    alexaRequest: SHSRequest | null,
    error: any
  ): SHSError {
    let message: string = "unknown";
    let name: string = "unknown";
    if ("message" in error) {
      message = error.message;
    }
    if ("name" in error) {
      name = error.name;
    }
    if ("code" in error) {
      name = error.code;
    }
    return new SHSError(
      alexaRequest,
      500,
      "INTERNAL_ERROR",
      `${message} (${name})`
    );
  }

  export function errorResponseForWrongDirectiveNamespace(
    alexaRequest: SHSRequest,
    namespace: string
  ): SHSError {
    return new SHSError(
      alexaRequest,
      400,
      "INVALID_DIRECTIVE",
      `expected namespace='${namespace}' but directive has namespace='${alexaRequest.directive.header.namespace}.`
    );
  }

  export function errorResponseForInvalidDirectiveNamespace(
    alexaRequest: SHSRequest
  ): SHSError {
    return new SHSError(
      alexaRequest,
      400,
      "INVALID_DIRECTIVE",
      `unknown namespace='${alexaRequest.directive.header.namespace}'.`
    );
  }

  export function errorResponseForInvalidDirectiveName(
    alexaRequest: SHSRequest
  ): SHSError {
    return new SHSError(
      alexaRequest,
      400,
      "INVALID_DIRECTIVE",
      `namespace='${alexaRequest.directive.header.namespace}' does not support name='${alexaRequest.directive.header.name}'.`
    );
  }

  export function errorResponseForInvalidValue(
    alexaRequest: SHSRequest,
    parameter: string
  ): SHSError {
    return new SHSError(
      alexaRequest,
      400,
      "INVALID_VALUE",
      `namespace=${alexaRequest.directive.header.namespace},name=${alexaRequest.directive.header.name}',parameter='${parameter}' has an invalid value.`
    );
  }
}
