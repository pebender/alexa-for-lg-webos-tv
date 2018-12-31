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

const uuid = require("uuid");

/**
 * Helper class to generate an AlexaResponse.
 * @class AlexaResponse
 * @classdesc AlexaResponse helps in creating Alexa Response messages.
 */
class AlexaResponse {

    /**
     * Constructor for an Alexa Response.
     * @constructor
     * @param {Object} [opts] Contains initialization options for the Alexa Response.
     * @returns {undefined}
     */
    constructor(opts) {
        if (typeof opts === "undefined") {
            // eslint-disable-next-line no-param-reassign
            opts = {};
        }

        if (Reflect.has(opts, "context")) {
            this.context = opts.context;
        }

        if (Reflect.has(opts, "event")) {
            this.event = opts.event;
        } else {
            const alts = {};
            alts.endpointId = "INVALID";
            alts.token = "INVALID";
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
    addContextProperty(opts) {
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
    addPayloadEndpoint(opts) {
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
    static createContextProperty(opts) {
        if (typeof opts === "undefined") {
            // eslint-disable-next-line no-param-reassign
            opts = {};
        }

        const property = {};
        property.namespace = Reflect.has(opts, "namespace") && opts.namespace !== ""
            ? opts.namespace
            : "Alexa.EndpointHealth";
        property.name = Reflect.has(opts, "name") && opts.name !== ""
            ? opts.name
            : "connectivity";
        property.value = Reflect.has(opts, "value") && opts.value !== {}
            ? opts.value
            : {"value": "OK"};
        property.timeOfSample = new Date().toISOString();
        property.uncertaintyInMilliseconds = Reflect.has(opts, "uncertaintyInMilliseconds")
            ? opts.uncertaintyInMilliseconds
            : 0;

        return property;
    }

    /**
     * Creates an endpoint for the payload.
     * @param {Object} [opts] Contains options for the endpoint.
     * @return {Object} An endpoint for the Alexa Reponse payload.
     */
    static createPayloadEndpoint(opts) {
        if (typeof opts === "undefined") {
            // eslint-disable-next-line no-param-reassign
            opts = {};
        }

        // Return the proper structure expected for the endpoint
        const endpoint = {};
        endpoint.capabilities = Reflect.has(opts, "capabilities")
            ? opts.capabilities
            : [];
        endpoint.description = Reflect.has(opts, "description") && opts.description !== ""
            ? opts.description
            : "Sample Endpoint Description";
        endpoint.displayCategories = Reflect.has(opts, "displayCategories")
            ? opts.displayCategories
            : ["OTHER"];
        endpoint.endpointId = Reflect.has(opts, "endpointId") && opts.endpointId !== ""
            ? opts.endpointId
            : "endpoint-001";
        endpoint.friendlyName = Reflect.has(opts, "friendlyName") && opts.friendlyName !== ""
            ? opts.friendlyName
            : "Sample Endpoint";
        endpoint.manufacturerName = Reflect.has(opts, "manufacturerName") && opts.manufacturerName !== ""
            ? opts.manufacturerName
            : "Sample Manufacturer";
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
    static createPayloadEndpointCapability(opts) {
        if (typeof opts === "undefined") {
            // eslint-disable-next-line no-param-reassign
            opts = {};
        }

        const capability = {};
        capability.type = Reflect.has(opts, "type") && opts.type !== ""
            ? opts.type
            : "AlexaInterface";
        capability.interface = Reflect.has(opts, "interface") && opts.interface !== ""
            ? opts.interface
            : "Alexa";
        capability.version = Reflect.has(opts, "version") && opts.version !== ""
            ? opts.version
            : "3";
        const supported = Reflect.has(opts, "supported")
            ? opts.supported
            : false;
        if (supported) {
            capability.properties = {};
            capability.properties.supported = supported;
            capability.properties.proactivelyReported = Reflect.has(opts, "proactivelyReported")
                ? opts.proactivelyReported
                : false;
            capability.properties.retrievable = Reflect.has(opts, "retrievable")
                ? opts.retrievable
                : false;
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

module.exports = AlexaResponse;