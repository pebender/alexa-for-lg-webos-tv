import { randomUUID } from 'crypto'
import { copyElement } from './copy'
import {
  AlexaMessageEndpoint,
  AlexaMessageHeader,
  AlexaMessageNamespace
} from './common'

export interface AlexaResponseEventPayloadEndpointCapability {
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

export interface AlexaResponseEventPayloadEndpoint {
  description: string;
  displayCategories: string[];
  endpointId: string;
  friendlyName: string;
  manufacturerName: string;
  cookie?: {
    [x: string]: string;
  };
  capabilities: AlexaResponseEventPayloadEndpointCapability[];
  [x: string]: string | object | undefined;
}

export interface AlexaResponseEventPayload {
  endpoints?: AlexaResponseEventPayloadEndpoint[];
  type?: string;
  message?: string;
  [x: string]: string | object | undefined;
}

export interface AlexaResponseEvent {
  header: AlexaMessageHeader;
  endpoint?: AlexaMessageEndpoint;
  payload: AlexaResponseEventPayload;
  [x: string]: object | undefined;
}

export interface AlexaResponseContextProperty {
  namespace: AlexaMessageNamespace;
  name: string;
  instance?: string;
  value: boolean | number | string | object;
  timeOfSample: string;
  uncertaintyInMilliseconds: number;
  [x: string]: boolean | number | string | [] | object | undefined;
}

export interface AlexaResponseContext {
  properties?: AlexaResponseContextProperty[];
  [x: string]: AlexaResponseContextProperty[] | undefined;
}

export class AlexaResponse {
  public event: AlexaResponseEvent
  public context?: AlexaResponseContext;
  [x: string]: object | undefined;
  public constructor (opts: {
    event: AlexaResponseEvent;
    context?: AlexaResponseContext;
  } | {
    namespace: AlexaMessageNamespace;
    name: string;
    instance?: string;
    correlationToken?: string;
    endpointId?: string;
    token?: string;
    payload?: AlexaResponseEventPayload;
  }) {
    const optsA = (opts as {
      event: AlexaResponseEvent;
      context?: AlexaResponseContext;
    })
    const optsB = (opts as {
      namespace: AlexaMessageNamespace;
      name: string;
      instance?: string;
      correlationToken?: string;
      endpointId?: string;
      token?: string;
      payload?: AlexaResponseEventPayload;
    })

    const response = {
      event: (copyElement(optsA.event) as AlexaResponseEvent) || {
        header: {
          namespace: optsB.namespace,
          name: optsB.name,
          instance: optsB.instance,
          messageId: randomUUID(),
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
        payload: (copyElement(optsB.payload) as AlexaResponseEventPayload) || {}
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

    this.event = (copyElement(response.event) as AlexaResponseEvent)
    if (typeof response.context !== 'undefined') {
      this.response = (copyElement(response.context) as AlexaResponseContext)
    }
  }

  public setEndpointId (endpointId: string) {
    if (typeof this.endpoint === 'undefined') {
      this.endpoint = {}
    }

    (this.endpoint as AlexaMessageEndpoint).endpointId = endpointId
  }

  public addContextProperty (contextProperty: AlexaResponseContextProperty): void {
    if (typeof this.context === 'undefined') {
      this.context = {}
    }
    if (typeof this.context.properties === 'undefined') {
      this.context.properties = []
    }

    this.context.properties.push(contextProperty)
  }

  public addPayloadEndpoint (payloadEndpoint: AlexaResponseEventPayloadEndpoint): void {
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
  }): Promise<AlexaResponseContextProperty> {
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
    'namespace': AlexaMessageNamespace;
    'propertyNames'?: string[];
  }): Promise<AlexaResponseEventPayloadEndpointCapability> {
    const capability: AlexaResponseEventPayloadEndpointCapability = {
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
