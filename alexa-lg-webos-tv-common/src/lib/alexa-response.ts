import uuid = require("uuid/v4");
import {AlexaRequest} from "./alexa-request";
import {GenericError} from "./error-classes";

export type AlexaResponseEventPayloadEndpoint = {
    description: string,
    displayCategories: string[],
    endpointId: string,
    friendlyName: string,
    manufacturerName: string
    cookie?: any
    capabilities?: any[],
};

export type AlexaResponseEventPayloadEndpointInput = {
    capabilities?: any[],
    description?: string,
    displayCategories?: string[],
    endpointId?: string,
    friendlyName?: string,
    manufacturerName?: string
    cookie?: any
};

export type AlexaResponseEventPayloadEndpointCapability = {
    type: string,
    interface: string,
    version: string,
    properties?: {
        supported: {[x: string]: any},
        proactivelyReported: boolean,
        retrievable: boolean,
        supportedOperations?: string[];
    }
};

export type AlexaResponseEventPayloadEndpointCapabilityInput = {
    type?: string,
    interface?: string,
    version?: string,
    supported?: {[x: string]: any},
    proactivelyReported?: boolean,
    retrievable?: boolean,
    supportedOperations?: string[];
};

export type AlexaResponseContextProperty = {
    namespace: string,
    name: string,
    instance?: string,
    value: any,
    timeOfSample: string,
    uncertaintyInMilliseconds: number
};

export type AlexaResponseContextPropertyInput = {
    namespace: string,
    name: string,
    instance?: string,
    value: any
    timeOfSample?: string,
    uncertaintyInMilliseconds?: number
};

export class AlexaResponse {
    event: {
        header: {
            namespace: string,
            name: string,
            messageId: string,
            correlationToken?: string,
            payloadVersion: "3",
            [x: string]: any,
        },
        endpoint?: {
            endpointId: string,
            scope?: {
                type: "BearerToken",
                token: string,
                [x: string]: any,
            },
            cookie?: {[x: string]: any},
            [x: string]: any,
        },
        payload: {[x: string]: any},
        [x: string]: any,
    };
    context?: {[x: string]: any};
    constructor(opts: {
        event?: {[x: string]: any},
        context?: {[x: string]: any},
        request?: AlexaRequest,
        namespace?: string,
        name?: string,
        instance?: string,
        correlationToken?: string,
        endpointId?: string,
        token?: any,
        payload?: {[x: string]: any},
    }) {
        const response: {[x: string]: any} = {};
        if (Reflect.has(opts, "event")) {
            response.event = copyElement(opts.event);
        }
        if (Reflect.has(opts, "context")) {
            response.context = copyElement(opts.context);
        }
        if (Reflect.has(opts, "request")) {
            const directive: {[x: string]: any} = (opts.request as AlexaRequest).directive;
            if (Reflect.has(directive.header, "correlationToken")) {
                if (Reflect.has(response, "event") === false) {
                    response.event = {};
                }
                if (Reflect.has(response.event, "header") === false) {
                    response.event.header = {};
                }
                response.event.header.correlationToken  = directive.header.correlationToken;
            }
            if ((Reflect.has(directive, "endpoint") && Reflect.has(directive.endpoint, "endpointId")) === false) {
                if (Reflect.has(response, "event") === false) {
                    response.event = {};
                }
                if (Reflect.has(response.event, "endpoint") === false) {
                    response.event.endpoint = {};
                }
                response.event.endpoint.endpointId = directive.enpoint.endpointId;
            }
        }
        if (Reflect.has(opts, "namespace")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "header") === false) {
                response.event.header = {};
            }
            response.event.header.namespace  = opts.namespace;
        }
        if (Reflect.has(opts, "name")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "header") === false) {
                response.event.header = {};
            }
            response.event.header.name  = opts.name;
        }
        if (Reflect.has(opts, "instance")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "header") === false) {
                response.event.header = {};
            }
            response.event.header.instance  = opts.instance;
        }
        if (Reflect.has(opts, "correlationToken")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "header") === false) {
                response.event.header = {};
            }
            response.event.header.correlationToken  = opts.correlationToken;
        }
        if (Reflect.has(opts, "endpointId")) {
            if (Reflect.has(response, "event") === false) {
                response.event = {};
            }
            if (Reflect.has(response.event, "endpoint") === false) {
                response.event.endpoint = {};
            }
            response.event.endpoint.endpointId  = opts.endpointId;
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
            response.event.endpoint.scope.token  = opts.token;
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

        function copyElement(original: any): any {
            let copy: any;
        
            if (original === null || (typeof original === "object") === false) {
                return original;
            }
        
            if (original instanceof Array) {
                copy = [];
                (copy as Array<any>).forEach((item) => {
                    copy.push(item);
                });
                return copy;
            }
        
            if (original instanceof Object) {
                copy = {};
                for (let property in original) {
                    if (original.hasOwnProperty(property)) {
                        copy[property] = copyElement(original[property]);
                    }
                }
                return copy;
            }
        
            throw new GenericError("error", "failed to copy AlexaResponse");
        }
    }

    addContextProperty(opts: AlexaResponseContextPropertyInput): void {
        if (Reflect.has(this, "context") === false) {
            this.context = {};
        }
        const context: {[x: string]: any} = (this.context as {[x: string]: any});
        if (Reflect.has(context, "properties") === false) {
            context.properties = [];
        }
        (this.context as {[x: string]: any}).properties.push(AlexaResponse.createContextProperty(opts));
    }

    addPayloadEndpoint(opts: AlexaResponseEventPayloadEndpointInput): void {
        if (Reflect.has(this.event, "payload") === false) {
            this.event.payload = {};
        }
        if (Reflect.has(this.event.payload, "endpoints") === false) {
            (this.event.payload as {[x: string]: any}).endpoints = [];
        }

        this.event.payload.endpoints.push(AlexaResponse.createPayloadEndpoint(opts));
    }

    static createContextProperty(opts: AlexaResponseContextPropertyInput): AlexaResponseContextProperty {
        const property: AlexaResponseContextProperty = {
            namespace: Reflect.has(opts, "namespace") && opts.namespace !== ""
                ? (opts.namespace as string)
                : "Alexa.EndpointHealth",
            name: Reflect.has(opts, "name") && opts.name !== ""
                ? (opts.name as string)
                : "connectivity",
            value: Reflect.has(opts, "value") && opts.value !== {}
                ? opts.value
                : {"value": "OK"},
            timeOfSample: new Date().toISOString(),
            uncertaintyInMilliseconds: Reflect.has(opts, "uncertaintyInMilliseconds")
                ? (opts.uncertaintyInMilliseconds as number)
                : 0
        }
        if (Reflect.has(opts, "instance")) {
            property.instance = opts.instance;
        }

        return property;
    }

    static createPayloadEndpoint(opts: AlexaResponseEventPayloadEndpointInput): AlexaResponseEventPayloadEndpoint {
        // Return the proper structure expected for the endpoint
        const endpoint: AlexaResponseEventPayloadEndpoint = {
        capabilities: Reflect.has(opts, "capabilities")
            ? (opts.capabilities as any[])
            : [],
        description: Reflect.has(opts, "description") && opts.description !== ""
            ? (opts.description as string)
            : "Sample Endpoint Description",
        displayCategories: Reflect.has(opts, "displayCategories")
            ? (opts.displayCategories as string[])
            : ["OTHER"],
        endpointId: Reflect.has(opts, "endpointId") && opts.endpointId !== ""
            ? (opts.endpointId as string)
            : "endpoint-001",
        friendlyName: Reflect.has(opts, "friendlyName") && opts.friendlyName !== ""
            ? (opts.friendlyName as string)
            : "Sample Endpoint",
        manufacturerName: Reflect.has(opts, "manufacturerName") && opts.manufacturerName !== ""
            ? (opts.manufacturerName as string)
            : "Sample Manufacturer"
        };
        if (Reflect.has(opts, "cookie")) {
            endpoint.cookie = opts.cookie;
        }

        return endpoint;
    }

    static createPayloadEndpointCapability(opts: AlexaResponseEventPayloadEndpointCapabilityInput): AlexaResponseEventPayloadEndpointCapability {
        const capability: AlexaResponseEventPayloadEndpointCapability = {
            type: Reflect.has(opts, "type") && opts.type !== ""
                ? (opts.type as string)
                : "AlexaInterface",
            interface: Reflect.has(opts, "interface") && opts.interface !== ""
                ? (opts.interface as string)
                : "Alexa",
            version: Reflect.has(opts, "version") && opts.version !== ""
                ? (opts.version as string)
                : "3"
        };
        const supported = Reflect.has(opts, "supported")
            ? true
            : false;
        if (supported) {
            capability.properties = {
                supported: (opts.supported as [{[x: string]: any}]),
                proactivelyReported: Reflect.has(opts, "proactivelyReported")
                    ? (opts.proactivelyReported as boolean)
                    : false,
                retrievable: Reflect.has(opts, "retrievable")
                    ? (opts.retrievable as boolean)
                    : false
            };
        }

        return capability;
    }
};