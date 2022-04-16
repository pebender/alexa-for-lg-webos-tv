import {
  Endpoint,
  Header,
  Namespace
} from './common'
import { copyElement } from './copy'
import { v4 as uuid } from 'uuid'

export interface ResponseEventPayloadEndpointCapability {
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
      '@type': 'text';
      value: {
        text: string;
        locale: 'en-US';
      };
    }[];
  };
  [x: string]: string | object | undefined;
}

export interface ResponseEventPayloadEndpoint {
  description: string;
  displayCategories: string[];
  endpointId: string;
  friendlyName: string;
  manufacturerName: string;
  cookie?: {
    [x: string]: string;
  };
  capabilities: ResponseEventPayloadEndpointCapability[];
  [x: string]: string | object | undefined;
}

export interface ResponseEventPayload {
  endpoints?: ResponseEventPayloadEndpoint[];
  type?: string;
  message?: string;
  [x: string]: string | object | undefined;
}

export interface ResponseEvent {
  header: Header;
  endpoint?: Endpoint;
  payload: ResponseEventPayload;
  [x: string]: object | undefined;
}

export interface ResponseContextProperty {
  namespace: Namespace;
  name: string;
  instance?: string;
  value: boolean | number | string | object;
  timeOfSample: string;
  uncertaintyInMilliseconds: number;
  [x: string]: boolean | number | string | [] | object | undefined;
}

export interface ResponseContext {
  properties?: ResponseContextProperty[];
  [x: string]: ResponseContextProperty[] | undefined;
}

export class Response {
  public event: ResponseEvent
  public context?: ResponseContext;
  [x: string]: object | undefined;
  public constructor (opts: {
    event: ResponseEvent;
    context?: ResponseContext;
  } | {
    namespace: Namespace;
    name: string;
    instance?: string;
    correlationToken?: string;
    endpointId?: string;
    token?: string;
    payload?: ResponseEventPayload;
  }) {
    const optsA = (opts as {
      event: ResponseEvent;
      context?: ResponseContext;
    })
    const optsB = (opts as {
      namespace: Namespace;
      name: string;
      instance?: string;
      correlationToken?: string;
      endpointId?: string;
      token?: string;
      payload?: ResponseEventPayload;
    })

    const response = {
      event: (copyElement(optsA.event) as ResponseEvent) || {
        header: {
          namespace: optsB.namespace,
          name: optsB.name,
          instance: optsB.instance,
          messageId: uuid(),
          correlationToken: optsB.correlationToken,
          payloadVersion: '3'
        },
        endpoint: {
          endpointId: optsB.endpointId,
          scope: {
            type: optsB.token && 'BearerToken',
            token: optsB.token
          }
        },
        payload: (copyElement(optsB.payload) as ResponseEventPayload) || {}
      },
      context: optsA.context
    }

    if (typeof response.event.endpoint !== 'undefined' &&
        typeof response.event.endpoint.scope !== 'undefined' &&
        typeof response.event.endpoint.scope.type === 'undefined' &&
        typeof response.event.endpoint.scope.token === 'undefined') {
      Reflect.deleteProperty(response.event.endpoint, 'scope')
    }
    if (typeof response.event.endpoint !== 'undefined' &&
        typeof response.event.endpoint.endpointId === 'undefined' &&
        typeof response.event.endpoint.scope === 'undefined') {
      Reflect.deleteProperty(response.event, 'endpoint')
    }

    this.event = (copyElement(response.event) as ResponseEvent)
    if (typeof response.context !== 'undefined') {
      this.response = (copyElement(response.context) as ResponseContext)
    }
  }

  public setEndpointId (endpointId: string) {
    if (typeof this.endpoint === 'undefined') {
      this.endpoint = {}
    }

    (this.endpoint as Endpoint).endpointId = endpointId
  }

  public addContextProperty (contextProperty: ResponseContextProperty): void {
    if (typeof this.context === 'undefined') {
      this.context = {}
    }
    if (typeof this.context.properties === 'undefined') {
      this.context.properties = []
    }

    this.context.properties.push(contextProperty)
  }

  public addPayloadEndpoint (payloadEndpoint: ResponseEventPayloadEndpoint): void {
    if (typeof this.event.payload.endpoints === 'undefined') {
      this.event.payload.endpoints = []
    }

    this.event.payload.endpoints.push(payloadEndpoint)
  }

  public static async buildContextProperty (opts: {
    'namespace': string;
    'name': string;
    'instance'?: string;
    'value': () => boolean | number | string | [] | object;
  }): Promise<ResponseContextProperty> {
    const startTime = new Date()
    const value = await opts.value()
    const endTime = new Date()
    return {
      namespace: opts.namespace,
      name: opts.name,
      value,
      timeOfSample: endTime.toISOString(),
      uncertaintyInMilliseconds: endTime.getTime() - startTime.getTime()
    }
  }

  public static buildPayloadEndpointCapability (opts: {
    'namespace': Namespace;
    'propertyNames'?: string[];
  }): Promise<ResponseEventPayloadEndpointCapability> {
    const capability: ResponseEventPayloadEndpointCapability = {
      type: 'AlexaInterface',
      interface: opts.namespace,
      version: '3'
    }
    if (typeof opts.propertyNames !== 'undefined') {
      capability.properties = {
        supported: opts.propertyNames.map((name: string): {'name': string} => ({ name })),
        proactivelyReported: false,
        retrievable: true
      }
    }
    return Promise.resolve(capability)
  }
}

export class ResponseCapsule {
  public httpStatusCode?: number
  public response: Response

  constructor (response: Response, httpStatusCode: number | null) {
    if (httpStatusCode !== null) {
      this.httpStatusCode = httpStatusCode
    }
    this.response = response
  }
}
