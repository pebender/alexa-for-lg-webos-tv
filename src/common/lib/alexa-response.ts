/* eslint-disable max-lines */
import {AlexaEndpoint,
    AlexaHeader,
    copyElement} from "./alexa-request";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require("uuid/v4");

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
            "@type": "text";
            value: {
                text: string;
                locale: "en-US";
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
    header: AlexaHeader;
    endpoint?: AlexaEndpoint;
    payload: AlexaResponseEventPayload;
    [x: string]: object | undefined;
}

export interface AlexaResponseContextProperty {
    namespace: string;
    name: string;
    instance?: string;
    value: boolean | number | string | object;
    timeOfSample: string;
    uncertaintyInMilliseconds: number;
    [x: string]: boolean | number | string | object | undefined;
}

export interface AlexaResponseContext {
    properties?: AlexaResponseContextProperty[];
    [x: string]: AlexaResponseContextProperty[] | undefined;
}

export class AlexaResponse {
    public event: AlexaResponseEvent;
    public context?: AlexaResponseContext;
    [x: string]: object | undefined;
    public constructor(opts: {
        event: AlexaResponseEvent;
        context?: AlexaResponseContext;
    } | {
        namespace: string;
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
        });
        const optsB = (opts as {
            namespace: string;
            name: string;
            instance?: string;
            correlationToken?: string;
            endpointId?: string;
            token?: string;
            payload?: AlexaResponseEventPayload;
        });

        if (typeof optsA.event !== "undefined" || typeof optsA.context !== "undefined") {
            if (!(typeof optsA.event === "object")) {
                throw new TypeError("'opts.direct' must be type 'object'");
            }
            if (!(typeof optsA.event.header === "object")) {
                throw new TypeError("'opts.event.header' must be type 'object'");
            }
            if (!(typeof optsA.event.header.namespace === "string")) {
                throw new TypeError("'opts.event.header.namespace' must be type 'string'");
            }
            if (!(typeof optsA.event.header.name === "string")) {
                throw new TypeError("'opts.event.header.name' must be type 'string'");
            }
            if (!(typeof optsA.event.header.instance === "string" ||
                  typeof optsA.event.header.instance === "undefined")) {
                throw new TypeError("'opts.event.header.instance' must be type 'string'");
            }
            if (!(typeof optsA.event.header.messageId === "string")) {
                throw new TypeError("'opts.event.header.messageId' must be type 'string'");
            }
            if (!(typeof optsA.event.header.correlationToken === "string" ||
                  typeof optsA.event.header.correlationToken === "undefined")) {
                throw new TypeError("'opts.event.header.correlationToken' must be type 'string' when set");
            }
            if (!(typeof optsA.event.header.payloadVersion === "string")) {
                throw new TypeError("'opts.event.header.payloadVersion' must be type 'string'");
            }
            if (!(optsA.event.header.payloadVersion === "3")) {
                throw new RangeError("'opts.event.header.payloadVersion' must be a 'string' of '3'.");
            }
            if (!(typeof optsA.event.endpoint === "object" ||
                  typeof optsA.event.endpoint === "undefined")) {
                throw new TypeError("'opts.event.endpoint' requires type 'object' when set");
            }
            if (!(typeof optsA.event.payload === "object")) {
                throw new TypeError("'opts.event.payload' requires type 'object'");
            }
            if (!(typeof optsA.context === "object" ||
                  typeof optsA.context === "undefined")) {
                throw new TypeError("'opts.context' requires type 'object' when set");
            }
            if (!(typeof optsB.namespace === "undefined")) {
                throw new TypeError("'opts.namespace' must not be set when 'opts.event' is set");
            }
            if (!(typeof optsB.name === "undefined")) {
                throw new TypeError("'opts.name' must not be set when 'opts.event' is set");
            }
            if (!(typeof optsB.instance === "undefined")) {
                throw new TypeError("'opts.instance' must not be set when 'opts.event' is set");
            }
            if (!(typeof optsB.correlationToken === "undefined")) {
                throw new TypeError("'opts.correlationToken' must not be set when 'opts.event' is set");
            }
            if (!(typeof optsB.endpointId === "undefined")) {
                throw new TypeError("'opts.endpointId' must not be set when 'opts.event' is set");
            }
            if (!(typeof optsB.token === "undefined")) {
                throw new TypeError("'opts.token' must not be set when 'opts.event' is set");
            }
            if (!(typeof optsB.payload === "undefined")) {
                throw new TypeError("'opts.payload' must not be set when 'opts.event' is set");
            }
        } else {
            if (!(typeof optsB.namespace === "string")) {
                throw new TypeError("'opts.namespace' must be type 'string' when 'opts.event' not set");
            }
            if (!(typeof optsB.name === "string")) {
                throw new TypeError("'opts.name' must be type 'string' when 'opts.event' not set");
            }
            if (!(typeof optsB.instance === "string" ||
                  typeof optsB.instance === "undefined")) {
                throw new TypeError("'opts.instance' requires type 'string' when set");
            }
            if (!(typeof optsB.instance === "string" ||
                  typeof optsB.instance === "undefined")) {
                throw new TypeError("'opts.instance' requires type 'string' when set");
            }
            if (!(typeof optsB.correlationToken === "string" ||
                  typeof optsB.correlationToken === "undefined")) {
                throw new TypeError("'opts.correlationToken' requires type 'string' when set");
            }
            if (!(typeof optsB.endpointId === "string" ||
                  typeof optsB.endpointId === "undefined")) {
                throw new TypeError("'opts.endpointId' requires type 'string' when set");
            }
            if (!(typeof optsB.token === "string" ||
                  typeof optsB.token === "undefined")) {
                throw new TypeError("'opts.correlationToken' requires type 'string' when set");
            }
            if (!(typeof optsB.payload === "object" ||
                  typeof optsB.payload === "undefined")) {
                throw new TypeError("'opts.correlationToken' requires type 'object' when set");
            }

            if (optsB.namespace === "Alexa.RangeController" &&
                !(typeof optsB.instance === "string")) {
                throw new TypeError("'opts.instance' must be type 'string' when 'opts.event' not set");
            }
        }

        const response = {
            "event": (copyElement(optsA.event) as AlexaResponseEvent) || {
                "header": {
                    "namespace": optsB.namespace,
                    "name": optsB.name,
                    "instance": optsB.instance,
                    "messageId": uuid(),
                    "correlationToken": optsB.correlationToken,
                    "payloadVersion": "3"
                },
                "endpoint": {
                    "endpointId": optsB.endpointId,
                    "scope": {
                        "type": optsB.token && "BearerToken",
                        "token": optsB.token
                    }
                },
                "payload": (copyElement(optsB.payload) as AlexaResponseEventPayload) || {}
            },
            "context": optsA.context
        };

        if (typeof response.event.endpoint !== "undefined" &&
            typeof response.event.endpoint.scope !== "undefined" &&
            typeof response.event.endpoint.scope.type === "undefined" &&
            typeof response.event.endpoint.scope.token === "undefined") {
            Reflect.deleteProperty(response.event.endpoint, "scope");
        }
        if (typeof response.event.endpoint !== "undefined" &&
            typeof response.event.endpoint.endpointId === "undefined" &&
            typeof response.event.endpoint.scope === "undefined") {
            Reflect.deleteProperty(response.event, "endpoint");
        }

        this.event = (copyElement(response.event) as AlexaResponseEvent);
        if (typeof response.context !== "undefined") {
            this.response = (copyElement(response.context) as AlexaResponseContext);
        }
    }

    public addContextProperty(contextProperty: AlexaResponseContextProperty): void {
        if (typeof this.context === "undefined") {
            this.context = {};
        }
        if (typeof this.context.properties === "undefined") {
            this.context.properties = [];
        }

        this.context.properties.push(contextProperty);
    }

    public addPayloadEndpoint(payloadEndpoint: AlexaResponseEventPayloadEndpoint): void {
        if (typeof this.event.payload.endpoints === "undefined") {
            this.event.payload.endpoints = [];
        }

        this.event.payload.endpoints.push(payloadEndpoint);
    }

    public static async buildContextProperty(opts: {
        "namespace": string;
        "name": string;
        "instance"?: string;
        "value": () => boolean | number | string | object;
    }): Promise<AlexaResponseContextProperty> {
        const startTime = new Date();
        const value = await opts.value();
        const endTime = new Date();
        return {
            "namespace": opts.namespace,
            "name": opts.name,
            "value": value,
            "timeOfSample": endTime.toISOString(),
            "uncertaintyInMilliseconds": endTime.getTime() - startTime.getTime()
        };
    }
}