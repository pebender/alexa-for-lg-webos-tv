import { randomUUID } from "node:crypto";
import * as CommonError from "../error";
import * as CommonDebug from "../debug";
import { copyElement } from "./copy";
import type { Namespace, Header, Endpoint } from "./common";
import type { Request } from "./request";

export interface EventPayloadEndpointCapability {
  type: string;
  interface: string;
  version: string;
  properties?: {
    supported: Array<{
      name: string;
    }>;
    proactivelyReported: boolean;
    retrievable: boolean;
  };
  // 'supportedOperations' for 'Alexa.PlaybackController'
  supportedOperations?: string[];
  // 'instance', capabilityResources' and 'configuration' for 'Alexa.RangeController'
  instance?: string;
  configuration?: object;
  capabilityResources?: Array<{
    friendlyNames: {
      "@type": "text";
      value: {
        text: string;
        locale: "en-US";
      };
    };
  }>;
  [x: string]: string | object | undefined;
}

export interface EventPayloadEndpoint {
  description: string;
  displayCategories: string[];
  endpointId: string;
  friendlyName: string;
  manufacturerName: string;
  cookie?: Record<string, string>;
  capabilities: EventPayloadEndpointCapability[];
  [x: string]: string | object | undefined;
}

export interface EventPayload {
  endpoints?: EventPayloadEndpoint[];
  type?: string;
  message?: string;
  [x: string]: string | object | undefined;
}

export interface Event {
  header: Header;
  endpoint?: Endpoint;
  payload: EventPayload;
  [x: string]: object | undefined;
}

export interface ContextProperty {
  namespace: Namespace;
  name: string;
  instance?: string;
  value: boolean | number | string | object;
  timeOfSample: string;
  uncertaintyInMilliseconds: number;
  [x: string]: boolean | number | string | [] | object | undefined;
}

export interface Context {
  properties?: ContextProperty[];
  [x: string]: ContextProperty[] | undefined;
}

export class Response {
  public event: Event;
  public context?: Context;
  public constructor(
    opts:
      | {
          event: Event;
          context?: Context;
        }
      | {
          namespace: Namespace;
          name: string;
          instance?: string;
          correlationToken?: string;
          endpointId?: string;
          token?: string;
          payload?: EventPayload;
        },
  ) {
    const optsA = opts as {
      event: Event;
      context?: Context;
    };
    const optsB = opts as {
      namespace: Namespace;
      name: string;
      instance?: string;
      correlationToken?: string;
      endpointId?: string;
      token?: string;
      payload?: EventPayload;
    };

    const response = {
      event: (copyElement(optsA.event) as Event | undefined) ?? {
        header: {
          namespace: optsB.namespace,
          name: optsB.name,
          instance: optsB.instance,
          messageId: randomUUID(),
          correlationToken: optsB.correlationToken,
          payloadVersion: "3",
        },
        endpoint: {
          endpointId: optsB.endpointId,
          scope: {
            type: typeof optsB.token === "string" ? "BearerToken" : undefined,
            token: optsB.token,
          },
        },
        payload: (copyElement(optsB.payload) as EventPayload | undefined) ?? {},
      },
      context: optsA.context,
    };

    if (
      response.event.endpoint !== undefined &&
      response.event.endpoint.scope?.type === undefined &&
      response.event.endpoint.scope?.token === undefined
    ) {
      Reflect.deleteProperty(response.event.endpoint, "scope");
    }
    if (
      response.event.endpoint !== undefined &&
      response.event.endpoint.endpointId === undefined &&
      response.event.endpoint.scope === undefined
    ) {
      Reflect.deleteProperty(response.event, "endpoint");
    }

    this.event = copyElement(response.event) as Event;
    if (response.context !== undefined) {
      this.context = copyElement(response.context) as Context;
    }
  }

  public addContextProperty(contextProperty: ContextProperty): void {
    if (this.context === undefined) {
      this.context = {};
    }
    if (this.context.properties === undefined) {
      this.context.properties = [];
    }

    this.context.properties.push(contextProperty);
  }

  public addPayloadEndpoint(payloadEndpoint: EventPayloadEndpoint): void {
    if (this.event.payload.endpoints === undefined) {
      this.event.payload.endpoints = [];
    }

    this.event.payload.endpoints.push(payloadEndpoint);
  }

  public static async buildContextProperty(opts: {
    namespace: Namespace;
    name: string;
    instance?: string;
    value: () => Promise<boolean | number | string | [] | object>;
  }): Promise<ContextProperty | null> {
    try {
      const startTime = new Date();
      const value = await opts.value();
      const endTime = new Date();
      return {
        namespace: opts.namespace,
        name: opts.name,
        value,
        timeOfSample: endTime.toISOString(),
        uncertaintyInMilliseconds: endTime.getTime() - startTime.getTime(),
      };
    } catch (error) {
      CommonDebug.debugError(error);
      return null;
    }
  }

  public static async buildPayloadEndpointCapability(opts: {
    namespace: Namespace;
    propertyNames?: string[];
  }): Promise<EventPayloadEndpointCapability> {
    const capability: EventPayloadEndpointCapability = {
      type: "AlexaInterface",
      interface: opts.namespace,
      version: "3",
    };
    if (opts.propertyNames !== undefined) {
      capability.properties = {
        supported: opts.propertyNames.map((name: string): { name: string } => ({
          name,
        })),
        proactivelyReported: false,
        retrievable: true,
      };
    }
    return await Promise.resolve(capability);
  }

  public static buildAlexaResponse(request: Request): Response {
    return new Response({
      namespace: "Alexa",
      name: "Response",
      correlationToken: request.getCorrelationToken(),
      endpointId: request.getEndpointId(),
      payload: {},
    });
  }

  public static buildAlexaErrorResponse(
    request: Request,
    type: string,
    message?: string,
    error?: unknown,
  ): Response {
    const response = new Response({
      namespace: "Alexa",
      name: "ErrorResponse",
      correlationToken: request.getCorrelationToken(),
      endpointId: request.getEndpointId(),
      payload: {
        type,
        message: message ?? "",
      },
    });
    CommonDebug.debug("Response.buildAlexaErrorResponse");
    CommonDebug.debugError(error);
    return response;
  }

  public static buildAlexaErrorResponseForInternalError(
    request: Request,
    error: unknown,
  ): Response {
    if (error instanceof CommonError.CommonError) {
      const errorName = `${error.general}.${error.specific ?? "unknown"}`;
      const errorMessage = error.message === "" ? "unknown" : error.message;
      const type = "INTERNAL_ERROR";
      const message = `error: ${errorMessage} (${errorName})`;
      return this.buildAlexaErrorResponse(request, type, message, error);
    } else if (error instanceof Error) {
      const errorName = error.name === "" ? "unknown" : error.name;
      const errorMessage = error.message === "" ? "unknown" : error.message;
      const type = "INTERNAL_ERROR";
      const message = `error: ${errorMessage} (${errorName})`;
      return this.buildAlexaErrorResponse(request, type, message, error);
    } else {
      return this.buildAlexaErrorResponse(request, "unknown", "unknown", error);
    }
  }

  public static buildAlexaErrorResponseForInvalidDirectiveName(
    request: Request,
  ): Response {
    const type = "INVALID_DIRECTIVE";
    const message = `unknown 'name' '${request.directive.header.name}' in namespace '${request.directive.header.namespace}'.`;
    return this.buildAlexaErrorResponse(request, type, message);
  }

  public static buildAlexaErrorResponseForInvalidDirectiveNamespace(
    request: Request,
  ): Response {
    const type = "INVALID_DIRECTIVE";
    const message = `unknown namespace '${request.directive.header.namespace}'.`;
    return this.buildAlexaErrorResponse(request, type, message);
  }

  public static buildAlexaErrorResponseForInvalidValue(
    request: Request,
  ): Response {
    const type = "INVALID_VALUE";
    return this.buildAlexaErrorResponse(request, type);
  }

  public static buildAlexaErrorResponseNotSupportedInCurrentMode(
    request: Request,
    message?: string,
  ): Response {
    const type = "NOT_SUPPORTED_IN_CURRENT_MODE";
    return this.buildAlexaErrorResponse(request, type, message);
  }

  public static buildAlexaErrorResponseForValueOutOfRange(
    request: Request,
    validRange?: { minimumValue: unknown; maximumValue: unknown },
  ): Response {
    const type = "VALUE_OUT_OF_RANGE";
    const response = this.buildAlexaErrorResponse(request, type);
    if (validRange !== undefined) {
      response.event.payload.validRange = validRange;
    }
    return response;
  }

  public static buildAlexaErrorResponseForPowerOff(request: Request): Response {
    const type = "ENDPOINT_UNREACHABLE";
    const message = "The TV's power is off.";
    return this.buildAlexaErrorResponse(request, type, message);
  }

  public static buildAlexaErrorResponseAddError(
    request: Request,
    type: string,
    message: string,
  ): Response {
    const error = CommonError.create({ message });
    error.name = type;
    Error.captureStackTrace(error);
    return this.buildAlexaErrorResponse(request, type, message);
  }
}

export default Response;
