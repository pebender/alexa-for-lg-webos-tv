import * as CommonError from "../error";
import { Request } from "./request";
import { Response } from "./response";

export class ResponseWrapper {
  public readonly request: Request;
  public readonly response: Response;
  public readonly statusCode: number;
  public readonly error?: CommonError.CommonError;

  public constructor(
    request: Request,
    response: Response,
    statusCode?: number,
    error?: unknown,
  ) {
    this.request = request;
    this.response = response;
    this.statusCode = statusCode ?? 200;
    if (typeof error !== "undefined" && error !== null) {
      if (error instanceof CommonError.CommonError) {
        this.error = error;
      } else {
        this.error = CommonError.create({ cause: error });
      }
    }
  }

  public static buildAlexaResponse(request: Request) {
    const response = new Response({
      namespace: "Alexa",
      name: "Response",
      correlationToken: request.getCorrelationToken(),
      endpointId: request.getEndpointId(),
      payload: {},
    });
    return new ResponseWrapper(request, response);
  }

  public static buildAlexaErrorResponse(
    request: Request,
    type: string,
    message: string,
    statusCode?: number,
    error?: unknown,
  ) {
    const response = new Response({
      namespace: "Alexa",
      name: "ErrorResponse",
      correlationToken: request.getCorrelationToken(),
      endpointId: request.getEndpointId(),
      payload: {
        type,
        message,
      },
    });
    return new ResponseWrapper(request, response, statusCode, error);
  }

  public static buildAlexaErrorResponseForInternalError(
    request: Request,
    statusCode?: number,
    error?: unknown,
  ) {
    if (error instanceof CommonError.CommonError) {
      const errorName = `${error.general}.${error.specific ?? "unknown"}`;
      const errorMessage = error.message || "unknown";
      const type = "INTERNAL_ERROR";
      const message = `error: ${errorMessage} (${errorName})`;
      return ResponseWrapper.buildAlexaErrorResponse(
        request,
        type,
        message,
        statusCode,
        error,
      );
    } else if (error instanceof Error) {
      const errorName = error.name || "unknown";
      const errorMessage = error.message || "unknown";
      const type = "INTERNAL_ERROR";
      const message = `error: ${errorMessage} (${errorName})`;
      return ResponseWrapper.buildAlexaErrorResponse(
        request,
        type,
        message,
        statusCode,
        error,
      );
    } else {
      return ResponseWrapper.buildAlexaErrorResponse(
        request,
        "unknown",
        "unknown",
        statusCode,
        error,
      );
    }
  }

  public static buildAlexaErrorResponseForInvalidDirectiveName(
    request: Request,
  ) {
    const type = "INVALID_DIRECTIVE";
    const message = `unknown 'name' '${request.directive.header.name}' in namespace '${request.directive.header.namespace}'.`;
    return ResponseWrapper.buildAlexaErrorResponse(request, type, message);
  }

  public static buildAlexaErrorResponseForInvalidDirectiveNamespace(
    request: Request,
  ) {
    const type = "INVALID_DIRECTIVE";
    const message = `unknown namespace '${request.directive.header.namespace}'.`;
    return ResponseWrapper.buildAlexaErrorResponse(request, type, message);
  }

  public static buildAlexaErrorResponseForInvalidValue(request: Request) {
    const type = "INVALID_VALUE";
    const message = "";
    return ResponseWrapper.buildAlexaErrorResponse(request, type, message);
  }

  public static buildAlexaErrorResponseNotSupportedInCurrentMode(
    request: Request,
    message?: string,
  ) {
    const type = "  NOT_SUPPORTED_IN_CURRENT_MODE";
    return ResponseWrapper.buildAlexaErrorResponse(
      request,
      type,
      message ?? "",
    );
  }

  public static buildAlexaErrorResponseForValueOutOfRange(
    request: Request,
    validRange?: { minimumValue: unknown; maximumValue: unknown },
  ) {
    const type = "VALUE_OUT_OF_RANGE";
    const message = "";
    const responseWrapper = ResponseWrapper.buildAlexaErrorResponse(
      request,
      type,
      message,
    );
    if (typeof validRange !== "undefined") {
      responseWrapper.response.event.payload.validRange = validRange;
    }
    return responseWrapper;
  }

  public static buildAlexaErrorResponseForPowerOff(request: Request) {
    const type = "ENDPOINT_UNREACHABLE";
    const message = "The TV's power is off.";
    return ResponseWrapper.buildAlexaErrorResponse(request, type, message);
  }

  public static buildAlexaErrorResponseAddError(
    request: Request,
    type: string,
    message: string,
    statusCode?: number,
  ) {
    const error = CommonError.create({ message });
    error.name = type;
    Error.captureStackTrace(error);
    return ResponseWrapper.buildAlexaErrorResponse(
      request,
      type,
      message,
      statusCode ?? 200,
      error,
    );
  }
}

export default ResponseWrapper;
