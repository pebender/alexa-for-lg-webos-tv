/* eslint-disable max-lines */
import {AlexaEndpoint,
    AlexaHeader} from "./alexa-request";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require("uuid/v4");
import {GenericError} from "./error-classes";

export interface AlexaResponseEventPayloadEndpointCapability {
    type: string;
    interface: string;
    version: string;
    instance?: string;
    properties?: {
        supported: {[x: string]: any};
        proactivelyReported: boolean;
        retrievable: boolean;
    };
    supportedOperations?: string[];
    configuration?: any;
    capabilityResources?: {
        friendlyNames: {
            "@type": "text";
            value: {
                text: string;
                locale: "en-US";
            };
        }[];
    };
}

export interface AlexaResponseEventPayloadEndpoint {
    description: string;
    displayCategories: string[];
    endpointId: string;
    friendlyName: string;
    manufacturerName: string;
    cookie?: {[x: string]: string};
    capabilities?: AlexaResponseEventPayloadEndpointCapability[];
}

export interface AlexaResponseEventPayload {
    endpoints?: AlexaResponseEventPayloadEndpoint[];
    type?: string;
    message?: string;
}

export interface AlexaResponseEvent {
    header: AlexaHeader;
    endpoint?: AlexaEndpoint;
    payload: AlexaResponseEventPayload;
}

export interface AlexaResponseContextProperty {
    namespace: string;
    name: string;
    instance?: string;
    value: any;
    timeOfSample: string;
    uncertaintyInMilliseconds: number;
}

export interface AlexaResponseContext {
    properties?: AlexaResponseContextProperty[];
}

function copyElement(original: any): any {
    let copy: any = null;

    if (original === null || (typeof original === "object") === false) {
        return original;
    }

    if (Array.isArray(original)) {
        copy = [];
        (original as any[]).forEach((item) => {
            if (typeof item !== "undefined") {
                copy.push(copyElement(item));
            }
        });
        return copy;
    }

    if (original instanceof Object) {
        copy = {};
        Object.keys(original).forEach((property) => {
            if (original[property] !== "undefined") {
                copy[property] = copyElement(original[property]);
            }
        });
        return copy;
    }

    throw new GenericError("error", "failed to copy AlexaResponse");
}

export class AlexaResponse {
    public event: AlexaResponseEvent;
    public context?: AlexaResponseContext;
    public constructor(opts: {
        event?: AlexaResponseEvent;
        context?: AlexaResponseContext;
        namespace?: string;
        name?: string;
        instance?: string;
        correlationToken?: string;
        endpointId?: string;
        token?: any;
        payload?: AlexaResponseEventPayload;
    }) {
        const response: {[x: string]: any} = {};
        if (Reflect.has(opts, "event")) {
            response.event = copyElement(opts.event);
        }
        if (Reflect.has(opts, "context")) {
            response.context = copyElement(opts.context);
        }
        if (Reflect.has(opts, "namespace")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "header") === false) {
                response.event.header = {};
            }
            response.event.header.namespace = opts.namespace;
        }
        if (Reflect.has(opts, "name")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "header") === false) {
                response.event.header = {};
            }
            response.event.header.name = opts.name;
        }
        if (Reflect.has(opts, "instance")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "header") === false) {
                response.event.header = {};
            }
            response.event.header.instance = opts.instance;
        }
        if (Reflect.has(opts, "correlationToken")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "header") === false) {
                response.event.header = {};
            }
            response.event.header.correlationToken = opts.correlationToken;
        }
        if (Reflect.has(opts, "endpointId")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "endpoint") === false) {
                response.event.endpoint = {};
            }
            response.event.endpoint.endpointId = opts.endpointId;
        }
        if (Reflect.has(opts, "token")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "endpoint") === false) {
                response.event.endpoint = {};
            }
            if (Reflect.has(response.event.endpoint, "scope") === false) {
                response.event.endpoint.scope = {};
            }
            response.event.endpoint.scope.token = opts.token;
        }
        if (Reflect.has(opts, "payload")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            response.event.payload = copyElement(opts.payload);
        }

        if (Reflect.has(response, "event") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.event'.");
        }
        if (Reflect.has(response.event, "header") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.event.header'.");
        }
        if (Reflect.has(response.event.header, "namespace") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.event.header.namespace'.");
        }
        if (Reflect.has(response.event.header, "name") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.event.header.name'.");
        }
        if (Reflect.has(response.event.header, "messageId") === false) {
            response.event.header.messageId = uuid();
        }
        if (Reflect.has(response.event.header, "payloadVersion") === false) {
            response.event.header.payloadVersion = "3";
        }
        if (Reflect.has(response.event, "payload") === false) {
            response.event.payload = {};
        }
        this.event = response.event;
        if (Reflect.has(response, "context")) {
            this.context = response.context;
        }
    }

    public addContextProperty(contextProperty: AlexaResponseContextProperty): void {
        if (Reflect.has(this, "context") === false) {
            this.context = {};
        }
        if (Reflect.has(this.context, "properties") === false) {
            this.context.properties = [];
        }

        this.context.properties.push(contextProperty);
    }

    public addPayloadEndpoint(payloadEndpoint: AlexaResponseEventPayloadEndpoint): void {
        if (Reflect.has(this.event, "payload") === false) {
            this.event.payload = {};
        }
        if (Reflect.has(this.event.payload, "endpoints") === false) {
            (this.event.payload as {[x: string]: any}).endpoints = [];
        }

        this.event.payload.endpoints.push(payloadEndpoint);
    }

    public static async buildContextProperty(opts: {
        "namespace": string;
        "name": string;
        "instance"?: string;
        "value": () => any;
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