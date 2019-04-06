/* eslint-disable max-lines */
import {AlexaEndpoint,
    AlexaHeader,
    copyElement} from "./alexa-request";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require("uuid/v4");
import {GenericError} from "./error-classes";

export interface AlexaResponseEventPayloadEndpointCapability {
    type: string;
    interface: string;
    version: string;
    instance?: string;
    properties?: {
        supported: {
            name: string;
        }[];
        proactivelyReported: boolean;
        retrievable: boolean;
    };
    supportedOperations?: string[];
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
    value: number | string | object;
    timeOfSample: string;
    uncertaintyInMilliseconds: number;
    [x: string]: number | string | object | undefined;
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
        event?: AlexaResponseEvent;
        context?: AlexaResponseContext;
        namespace?: string;
        name?: string;
        instance?: string;
        correlationToken?: string;
        endpointId?: string;
        token?: string;
        payload?: AlexaResponseEventPayload;
    }) {
        const response: {
            event?: {
                header?: {
                    [x: string]: string | undefined;
                };
                endpoint?: {
                    endpointId?: string;
                    scope?: {
                        type?: "BearerToken";
                        token?: string;
                        [x: string]: number | string | object | undefined;
                    };
                };
                payload?: object;
            };
            context?: object;
        } = {};
        if (typeof opts.event !== "undefined") {
            response.event = (copyElement(opts.event) as AlexaResponseEvent);
        }
        if (typeof opts.context !== "undefined") {
            response.context = (copyElement(opts.context) as AlexaResponseContext);
        }
        if (typeof opts.namespace !== "undefined") {
            if (typeof response.event === "undefined") {
                response.event = {};
            }
            if (typeof response.event.header === "undefined") {
                response.event.header = {};
            }
            response.event.header.namespace = opts.namespace;
        }
        if (typeof opts.name !== "undefined") {
            if (typeof response.event === "undefined") {
                response.event = {};
            }
            if (typeof response.event.header === "undefined") {
                response.event.header = {};
            }
            response.event.header.name = opts.name;
        }
        if (typeof opts.instance !== "undefined") {
            if (typeof response.event === "undefined") {
                response.event = {};
            }
            if (typeof response.event.header === "undefined") {
                response.event.header = {};
            }
            response.event.header.instance = opts.instance;
        }
        if (typeof opts.correlationToken !== "undefined") {
            if (typeof response.event === "undefined") {
                response.event = {};
            }
            if (typeof response.event.header === "undefined") {
                response.event.header = {};
            }
            response.event.header.correlationToken = opts.correlationToken;
        }

        if (typeof opts.endpointId !== "undefined") {
            if (typeof response.event === "undefined") {
                response.event = {};
            }
            if (typeof response.event.endpoint === "undefined") {
                response.event.endpoint = {};
            }
            response.event.endpoint.endpointId = opts.endpointId;
        }
        if (typeof opts.endpointId !== "undefined") {
            if (typeof response.event === "undefined") {
                response.event = {};
            }
            if (typeof response.event.endpoint === "undefined") {
                response.event.endpoint = {};
            }
            response.event.endpoint.endpointId = opts.endpointId;
        }
        if (typeof opts.token !== "undefined") {
            if (typeof response.event === "undefined") {
                response.event = {};
            }
            if (typeof response.event.endpoint === "undefined") {
                response.event.endpoint = {};
            }
            if (typeof response.event.endpoint.scope === "undefined") {
                response.event.endpoint.scope = {};
            }
            response.event.endpoint.scope.type = "BearerToken";
            response.event.endpoint.scope.token = opts.token;
        }

        if (typeof opts.payload !== "undefined") {
            if (typeof response.event === "undefined") {
                response.event = {};
            }
            if (typeof response.event.endpoint === "undefined") {
                response.event.endpoint = {};
            }
            response.event.payload = (copyElement(opts.payload) as AlexaResponseEventPayload);
        }

        if (typeof response.event === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.event'.");
        }
        if (typeof response.event.header === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.event.header'.");
        }
        if (typeof response.event.header.namespace === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.event.header.namespace'.");
        }
        if (typeof response.event.header.name === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.event.header.name'.");
        }
        if (typeof response.event.header.messageId === "undefined") {
            response.event.header.messageId = uuid();
        }
        if (typeof response.event.header.payloadVersion === "undefined") {
            response.event.header.payloadVersion = "3";
        }
        if (typeof response.event.payload === "undefined") {
            response.event.payload = {};
        }
        this.event = (response.event as AlexaResponseEvent);
        if (typeof response.context !== "undefined") {
            this.context = (response.context as AlexaResponseContext);
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
        if (typeof this.event.payload === "undefined") {
            this.event.payload = {};
        }
        if (typeof this.event.payload.endpoints === "undefined") {
            this.event.payload.endpoints = [];
        }

        this.event.payload.endpoints.push(payloadEndpoint);
    }

    public static async buildContextProperty(opts: {
        "namespace": string;
        "name": string;
        "instance"?: string;
        "value": () => number | string | object;
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