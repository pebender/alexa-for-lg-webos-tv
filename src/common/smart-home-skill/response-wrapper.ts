import * as CommonError from "../error";
import { Request } from "./request";
import { Response } from "./response";

export class ResponseWrapper {
  public readonly request: Request;
  public readonly response: Response;
  public readonly error?: CommonError.CommonError;

  public constructor(request: Request, response: Response, error?: unknown) {
    this.request = request;
    this.response = response;
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
    error?: unknown,
  ) {
    const response = Response.buildAlexaErrorResponse(
      request,
      type,
      message,
      error,
    );
    return new ResponseWrapper(request, response, error);
  }

  public static buildAlexaErrorResponseForInternalError(
    request: Request,
    error?: unknown,
  ) {
    const response = Response.buildAlexaErrorResponseForInternalError(
      request,
      error,
    );
    return new ResponseWrapper(request, response, error);
  }

  public static buildAlexaErrorResponseForInvalidDirectiveName(
    request: Request,
  ) {
    const response =
      Response.buildAlexaErrorResponseForInvalidDirectiveName(request);
    return new ResponseWrapper(request, response);
  }

  public static buildAlexaErrorResponseForInvalidDirectiveNamespace(
    request: Request,
  ) {
    const response =
      Response.buildAlexaErrorResponseForInvalidDirectiveNamespace(request);
    return new ResponseWrapper(request, response);
  }

  public static buildAlexaErrorResponseForInvalidValue(request: Request) {
    const response = Response.buildAlexaErrorResponseForInvalidValue(request);
    return new ResponseWrapper(request, response);
  }

  public static buildAlexaErrorResponseNotSupportedInCurrentMode(
    request: Request,
    message?: string,
  ) {
    const response = Response.buildAlexaErrorResponseNotSupportedInCurrentMode(
      request,
      message,
    );
    return new ResponseWrapper(request, response);
  }

  public static buildAlexaErrorResponseForValueOutOfRange(
    request: Request,
    validRange?: { minimumValue: unknown; maximumValue: unknown },
  ) {
    const response = Response.buildAlexaErrorResponseForValueOutOfRange(
      request,
      validRange,
    );
    return new ResponseWrapper(request, response);
  }

  public static buildAlexaErrorResponseForPowerOff(request: Request) {
    const response = Response.buildAlexaErrorResponseForPowerOff(request);
    return new ResponseWrapper(request, response);
  }

  public static buildAlexaErrorResponseAddError(
    request: Request,
    type: string,
    message: string,
  ) {
    const response = Response.buildAlexaErrorResponseAddError(
      request,
      type,
      message,
    );
    return new ResponseWrapper(request, response);
  }
}

export default ResponseWrapper;
