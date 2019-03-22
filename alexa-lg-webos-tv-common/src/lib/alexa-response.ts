/*
 * This file started as
 * <https://github.com/alexa/skill-sample-nodejs-smarthome-switch/commits/master/lambda/smarthome/alexa/skills/smarthome/AlexaResponse.js>
 * commit 3c18914.
 */

/*
 * -*- coding: utf-8 -*-
 *
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in
 * compliance with the License. A copy of the License is located at
 *
 *    http://aws.amazon.com/asl/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */

const uuid = require("uuid/v4");

/**
 * Helper class to generate an AlexaResponse.
 * @class AlexaResponse
 * @classdesc AlexaResponse helps in creating Alexa Response messages.
 */
export class AlexaResponse {
    /**
     * Constructor for an Alexa Response.
     * @constructor
     * @param {Object} [opts] Contains initialization options for the Alexa Response.
     * @returns {undefined}
     */
    context?: any;
    event?: any;
    constructor(opts: {
        context?: any,
        event?: any,
        request?: any,
        namespace?: string,
        name?: string,
        messageId?: string,
        payloadVersion?: string,
        token?: any,
        endpointId?: string,
        payload?: any,
        correlationToken?: string,
        instance?: string
    }) {
        if (Reflect.has(opts, "context")) {
            this.context = opts.context;
        }

        if (Reflect.has(opts, "event")) {
            this.event = opts.event;
        } else {
            const alts: {
                endpointId: string,
                token: string,
                correlationToken?: string,
            } = {
                endpointId: "INVALID",
                token: "INVALID"
            };
            if (Reflect.has(opts, "request") && Reflect.has(opts.request, "directive")) {
                if (Reflect.has(opts.request.directive, "header")) {
                    if (Reflect.has(opts.request.directive.header, "correlationToken")) {
                        alts.correlationToken = opts.request.directive.header.correlationToken;
                    }
                }
                if (Reflect.has(opts.request.directive, "endpoint")) {
                    if (Reflect.has(opts.request.directive.endpoint, "endpointId")) {
                        alts.endpointId = opts.request.directive.endpoint.endpointId;
                    }
                    if (Reflect.has(opts.request.directive.endpoint, "scope") &&
                        Reflect.has(opts.request.directive.endpoint.scope, "token")) {
                        alts.token = opts.request.directive.endpoint.scope.token;
                    }
                }
            }
            this.event = {
                "header": {
                    "namespace": Reflect.has(opts, "namespace") && opts.namespace !== ""
                        ? opts.namespace
                        : "Alexa",
                    "name": Reflect.has(opts, "name") && opts.name !== ""
                        ? opts.name
                        : "Response",
                    "messageId": Reflect.has(opts, "messageId") && opts.messageId !== ""
                        ? opts.messageId
                        : uuid(),
                    "payloadVersion": Reflect.has(opts, "payloadVersion") && opts.payloadVersion !== ""
                        ? opts.payloadVersion
                        : "3"
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": Reflect.has(opts, "token") && opts.token !== "" && opts.token !== {}
                            ? opts.token
                            : alts.token
                    },
                    "endpointId": Reflect.has(opts, "endpointId") && opts.endpointId !== ""
                        ? opts.endpointId
                        : alts.endpointId
                },
                "payload": Reflect.has(opts, "payload") && opts.payload !== {}
                    ? opts.payload
                    : {}
            };
            if (Reflect.has(alts, "correlationToken")) {
                this.event.header.correlationToken = alts.correlationToken;
            }
            if (Reflect.has(opts, "correlationToken")) {
                this.event.header.correlationToken = opts.correlationToken;
            }
            if (Reflect.has(opts, "instance")) {
                this.event.header.instance = opts.instance;
            }
        }

        // No endpoint in an AcceptGrant or Discover request
        if (this.event.header.name === "AcceptGrant.Response" ||
            this.event.header.name === "Discover.Response") {

            Reflect.deleteProperty(this.event, "endpoint");
        }
    }

    /**
     * Add a property to the context.
     * @param {Object} [opts] Contains options for the property.
     * @return {undefined}
     */
    addContextProperty(opts: {
        namespace?: string,
        name?: string,
        instance?: string,
        value?: any,
        timeOfSample?: string,
        uncertaintyInMilliseconds?: number
    }) {
        if (!Reflect.has(this, "context")) {
            this.context = {};
        }
        if (!Reflect.has(this.context, "properties")) {
            this.context.properties = [];
        }

        this.context.properties.push(AlexaResponse.createContextProperty(opts));
    }

    /**
     * Add an endpoint to the payload.
     * @param {Object} [opts] Contains options for the endpoint.
     * @returns {undefined}
     */
    addPayloadEndpoint(opts: {
        capabilities?: any[],
        description?: string,
        displayCategories?: string[],
        endpointId?: string,
        friendlyName?: string,
        manufacturerName?: string,
        cookie?: any
    }) {
        if (!Reflect.has(this, "event")) {
            this.event = {};
        }
        if (!Reflect.has(this.event, "payload")) {
            this.event.payload = {};
        }
        if (!Reflect.has(this.event.payload, "endpoints")) {
            this.event.payload.endpoints = [];
        }

        this.event.payload.endpoints.push(AlexaResponse.createPayloadEndpoint(opts));
    }

    /**
     * Creates a property for the context.
     * @param {Object} [opts] Contains options for the property.
     * @return {Object} A property for the Alexa Response context.
     */
    static createContextProperty(opts: {
        namespace?: string,
        name?: string,
        instance?: string,
        value?: any,
        timeOfSample?: string,
        uncertaintyInMilliseconds?: number
    }) {
        if (typeof opts === "undefined") {
            // eslint-disable-next-line no-param-reassign
            opts = {};
        }

        const property: {
            namespace: string,
            name: string,
            instance?: string,
            value: any,
            timeOfSample: string,
            uncertaintyInMilliseconds: number
        } = {
            namespace: Reflect.has(opts, "namespace") && opts.namespace !== ""
                ? <string>opts.namespace
                : "Alexa.EndpointHealth",
            name: Reflect.has(opts, "name") && opts.name !== ""
                ? <string>opts.name
                : "connectivity",
            value: Reflect.has(opts, "value") && opts.value !== {}
                ? opts.value
                : {"value": "OK"},
            timeOfSample: new Date().toISOString(),
            uncertaintyInMilliseconds: Reflect.has(opts, "uncertaintyInMilliseconds")
                ? <number>opts.uncertaintyInMilliseconds
                : 0
        }
        if (Reflect.has(opts, "instance")) {
            property.instance = opts.instance;
        }

        return property;
    }

    /**
     * Creates an endpoint for the payload.
     * @param {Object} [opts] Contains options for the endpoint.
     * @return {Object} An endpoint for the Alexa Reponse payload.
     */
    static createPayloadEndpoint(opts: {
        capabilities?: any[],
        description?: string,
        displayCategories?: string[],
        endpointId?: string,
        friendlyName?: string,
        manufacturerName?: string
        cookie?: any
    }) {
        // Return the proper structure expected for the endpoint
        const endpoint: {
            capabilities: any[],
            description: string,
            displayCategories: string[],
            endpointId: string,
            friendlyName: string,
            manufacturerName: string,
            cookie?: any
        } = {
        capabilities: Reflect.has(opts, "capabilities")
            ? <any[]>opts.capabilities
            : [],
        description: Reflect.has(opts, "description") && opts.description !== ""
            ? <string>opts.description
            : "Sample Endpoint Description",
        displayCategories: Reflect.has(opts, "displayCategories")
            ? <string[]>opts.displayCategories
            : ["OTHER"],
        endpointId: Reflect.has(opts, "endpointId") && opts.endpointId !== ""
            ? <string>opts.endpointId
            : "endpoint-001",
        friendlyName: Reflect.has(opts, "friendlyName") && opts.friendlyName !== ""
            ? <string>opts.friendlyName
            : "Sample Endpoint",
        manufacturerName: Reflect.has(opts, "manufacturerName") && opts.manufacturerName !== ""
            ? <string>opts.manufacturerName
            : "Sample Manufacturer"
        };
        if (Reflect.has(opts, "cookie")) {
            endpoint.cookie = opts.cookie;
        }

        return endpoint;
    }

    /**
     * Creates a capability for an endpoint within the payload.
     * @param {Object} [opts] Contains options for the endpoint capability.
     * @return {Object} A capability for Alexa Response payload.
     */
    static createPayloadEndpointCapability(opts: {
        type?: string,
        interface?: string,
        version?: string,
        supported?: boolean,
        proactivelyReported?: boolean,
        retrievable?: boolean
    }) {
        const capability: {
            type: string,
            interface: string,
            version: string,
            supported?: boolean,
            properties?: {
                supported: boolean,
                proactivelyReported: boolean,
                retrievable: boolean
            }
        } = {
            type: Reflect.has(opts, "type") && opts.type !== ""
                ? <string>opts.type
                : "AlexaInterface",
            interface: Reflect.has(opts, "interface") && opts.interface !== ""
                ? <string>opts.interface
                : "Alexa",
            version: Reflect.has(opts, "version") && opts.version !== ""
                ? <string>opts.version
                : "3"
        };
        const supported = Reflect.has(opts, "supported")
            ? opts.supported
            : false;
        if (supported) {
            capability.properties = {
                supported: true,
                proactivelyReported: Reflect.has(opts, "proactivelyReported")
                    ? <boolean>opts.proactivelyReported
                    : false,
                retrievable: Reflect.has(opts, "retrievable")
                    ? <boolean>opts.retrievable
                    : false
            };
        }

        return capability;
    }

    /**
     * Get the composed Alexa Response.
     * @returns {Object} The Alexa Response.
     */
    get() {
        return this;
    }
}