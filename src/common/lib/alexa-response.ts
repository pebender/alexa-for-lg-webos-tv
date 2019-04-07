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