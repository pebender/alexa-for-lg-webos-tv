import { randomUUID } from "crypto";
import { copyElement } from "./copy";
import { SHSDirective } from "./request";

export namespace SHSEvent {
  export namespace Header {
    export type Namespace = SHSDirective.Header.Namespace;
  }
  export interface Header {
    namespace: Header.Namespace;
    name: string;
    instance?: string;
    messageId: string;
    correlationToken?: string;
    payloadVersion: "3";
    [x: string]: string | undefined;
  }
  export interface Endpoint {
    endpointId: string;
    scope?: {
      type: "BearerToken";
      token: string;
      [x: string]: string;
    };
    cookie?: { [x: string]: string };
    [x: string]: string | object | undefined;
  }
  export namespace Payload {
    export namespace Endpoint {
      export namespace Capability {}
      export interface Capability {
        type: string;
        interface: string;
        version: string;
        properties?: {
          supported: {
            name: string;
          }[];
          proactivelyReported: boolean;
          retrievable: boolean;
        };
        // 'supportedOperations' for 'Alexa.PlaybackController'
        supportedOperations?: string[];
        // 'instance', capabilityResources' and 'configuration' for 'Alexa.RangeController'
        instance?: string;
        configuration?: object;
        capabilityResources?: {
          friendlyNames: {
            "@type": "text";
            value: {
              text: string;
              locale: "en-US";
            };
          }[];
        };
        [x: string]: string | object | undefined;
      }
    }
    export interface Endpoint {
      description: string;
      displayCategories: string[];
      endpointId: string;
      friendlyName: string;
      manufacturerName: string;
      cookie?: {
        [x: string]: string;
      };
      capabilities: Endpoint.Capability[];
      [x: string]: string | object | undefined;
    }
  }
  export interface Payload {
    endpoints?: Payload.Endpoint[];
    type?: string;
    message?: string;
    [x: string]: string | object | undefined;
  }
}
export interface SHSEvent {
  header: SHSEvent.Header;
  endpoint?: SHSEvent.Endpoint;
  payload: SHSEvent.Payload;
  [x: string]: object | undefined;
}
export namespace SHSContext {
  export namespace Property {
    export type Namespace = SHSEvent.Header.Namespace;
  }
  export interface Property {
    namespace: Property.Namespace;
    name: string;
    instance?: string;
    value: boolean | number | string | object;
    timeOfSample: string;
    uncertaintyInMilliseconds: number;
    [x: string]: boolean | number | string | [] | object | undefined;
  }
}
export interface SHSContext {
  properties?: SHSContext.Property[];
  [x: string]: SHSContext.Property[] | undefined;
}

export class SHSResponse {
  public event: SHSEvent;
  public context?: SHSContext;
  [x: string]: object | undefined;
  public constructor(
    opts:
      | {
          event: SHSEvent;
          context?: SHSContext;
        }
      | {
          namespace: SHSEvent.Header.Namespace;
          name: string;
          instance?: string;
          correlationToken?: string;
          endpointId?: string;
          token?: string;
          payload?: SHSEvent.Payload;
        }
  ) {
    const optsA = opts as {
      event: SHSEvent;
      context?: SHSContext;
    };
    const optsB = opts as {
      namespace: SHSEvent.Header.Namespace;
      name: string;
      instance?: string;
      correlationToken?: string;
      endpointId?: string;
      token?: string;
      payload?: SHSEvent.Payload;
    };

    const response = {
      event: (copyElement(optsA.event) as SHSEvent) || {
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
            type: optsB.token && "BearerToken",
            token: optsB.token,
          },
        },
        payload: (copyElement(optsB.payload) as SHSEvent.Payload) || {},
      },
      context: optsA.context,
    };

    if (
      typeof response.event.endpoint !== "undefined" &&
      typeof response.event.endpoint.scope !== "undefined" &&
      typeof response.event.endpoint.scope.type === "undefined" &&
      typeof response.event.endpoint.scope.token === "undefined"
    ) {
      Reflect.deleteProperty(response.event.endpoint, "scope");
    }
    if (
      typeof response.event.endpoint !== "undefined" &&
      typeof response.event.endpoint.endpointId === "undefined" &&
      typeof response.event.endpoint.scope === "undefined"
    ) {
      Reflect.deleteProperty(response.event, "endpoint");
    }

    this.event = copyElement(response.event) as SHSEvent;
    if (typeof response.context !== "undefined") {
      this.response = copyElement(response.context) as SHSContext;
    }
  }

  public setEndpointId(endpointId: string) {
    if (typeof this.endpoint === "undefined") {
      this.endpoint = {};
    }

    (this.endpoint as SHSEvent.Endpoint).endpointId = endpointId;
  }

  public addContextProperty(contextProperty: SHSContext.Property): void {
    if (typeof this.context === "undefined") {
      this.context = {};
    }
    if (typeof this.context.properties === "undefined") {
      this.context.properties = [];
    }

    this.context.properties.push(contextProperty);
  }

  public addPayloadEndpoint(payloadEndpoint: SHSEvent.Payload.Endpoint): void {
    if (typeof this.event.payload.endpoints === "undefined") {
      this.event.payload.endpoints = [];
    }

    this.event.payload.endpoints.push(payloadEndpoint);
  }

  public static async buildContextProperty(opts: {
    namespace: SHSContext.Property.Namespace;
    name: string;
    instance?: string;
    value: () => boolean | number | string | [] | object;
  }): Promise<SHSContext.Property> {
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
  }

  public static buildPayloadEndpointCapability(opts: {
    namespace: SHSEvent.Header.Namespace;
    propertyNames?: string[];
  }): Promise<SHSEvent.Payload.Endpoint.Capability> {
    const capability: SHSEvent.Payload.Endpoint.Capability = {
      type: "AlexaInterface",
      interface: opts.namespace,
      version: "3",
    };
    if (typeof opts.propertyNames !== "undefined") {
      capability.properties = {
        supported: opts.propertyNames.map((name: string): { name: string } => ({
          name,
        })),
        proactivelyReported: false,
        retrievable: true,
      };
    }
    return Promise.resolve(capability);
  }
}
