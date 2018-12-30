/* eslint-disable no-undefined */

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
     * Check a value for validity or return a default.
     * @param {*} value The value being checked
     * @param {*} defaultValue A default value if the passed value is not valid
     * @returns {*} The passed value if valid otherwise the default value.
     */
    static checkValue(value, defaultValue) {
        if (value === undefined || value === {} || value === "") {
            return defaultValue;
        }

        return value;
    }

    /**
     * Constructor for an Alexa Response.
     * @constructor
     * @param {Object} [opts=] Contains initialization options for the Alexa Response.
     * @returns {undefined}
     */
    constructor(opts) {

        if (opts === undefined) {
            // eslint-disable-next-line no-param-reassign
            opts = {};
        }

        if (opts.context !== undefined) {
            this.context = this.checkValue(opts.context, undefined);
        }

        if (opts.event !== undefined) {
            this.event = this.checkValue(opts.event, undefined);
        } else {
            this.event = {
                "header": {
                    "namespace": this.checkValue(opts.namespace, "Alexa"),
                    "name": this.checkValue(opts.name, "Response"),
                    "messageId": this.checkValue(opts.messageId, uuid()),
                    "correlationToken": this.checkValue(opts.correlationToken, undefined),
                    "payloadVersion": this.checkValue(opts.payloadVersion, "3")
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": this.checkValue(opts.token, "INVALID")
                    },
                    "endpointId": this.checkValue(opts.endpointId, "INVALID")
                },
                "payload": this.checkValue(opts.payload, {})
            };
        }

        // No endpoint in an AcceptGrant or Discover request
        if (this.event.header.name === "AcceptGrant.Response" ||
            this.event.header.name === "Discover.Response") {

            Reflect.deleteProperty(this.event, "endpoint");
        }
    }

    /**
     * Add a property to the context.
     * @param {Object} opts Contains options for the property.
     * @return {undefined}
     */
    addContextProperty(opts) {

        if (this.context === undefined) {
            this.context = {
                "properties": []
            };
        }

        this.context.properties.push(this.createContextProperty(opts));
    }

    /**
     * Add an endpoint to the payload.
     * @param {Object} opts Contains options for the endpoint.
     * @returns {undefined}
     */
    addPayloadEndpoint(opts) {

        if (this.event.payload.endpoints === undefined) {
            this.event.payload.endpoints = [];
        }

        this.event.payload.endpoints.push(this.createPayloadEndpoint(opts));
    }

    /**
     * Creates a property for the context.
     * @param {Object} opts Contains options for the property.
     * @return {Object} A property for the Alexa Response context.
     */
    createContextProperty(opts) {
        return {
            "namespace": this.checkValue(opts.namespace, "Alexa.EndpointHealth"),
            "name": this.checkValue(opts.name, "connectivity"),
            "value": this.checkValue(opts.value, {"value": "OK"}),
            "timeOfSample": new Date().toISOString(),
            "uncertaintyInMilliseconds": this.checkValue(opts.uncertaintyInMilliseconds, 0)
        };
    }

    /**
     * Creates an endpoint for the payload.
     * @param {Object} opts Contains options for the endpoint.
     * @return {Object} An endpoint for the Alexa Reponse payload.
     */
    createPayloadEndpoint(opts) {

        if (opts === undefined) {
            // eslint-disable-next-line no-param-reassign
            opts = {};
        }

        // Return the proper structure expected for the endpoint
        const endpoint =
            {
                "capabilities": this.checkValue(opts.capabilities, []),
                "description": this.checkValue(opts.description, "Sample Endpoint Description"),
                "displayCategories": this.checkValue(opts.displayCategories, ["OTHER"]),
                "endpointId": this.checkValue(opts.endpointId, "endpoint-001"),
                // "endpointId": this.checkValue(opts.endpointId, 'endpoint_' + (Math.floor(Math.random() * 90000) + 10000)),
                "friendlyName": this.checkValue(opts.friendlyName, "Sample Endpoint"),
                "manufacturerName": this.checkValue(opts.manufacturerName, "Sample Manufacturer")
            };

        if (Reflect.has(opts, "cookie")) {
            endpoint.cookie = this.checkValue("cookie", {});
        }

        return endpoint;
    }

    /**
     * Creates a capability for an endpoint within the payload.
     * @param {Object} opts Contains options for the endpoint capability.
     * @return {Object} A capability for Alexa Response payload.
     */
    createPayloadEndpointCapability(opts) {

        if (opts === undefined) {
            // eslint-disable-next-line no-param-reassign
            opts = {};
        }

        const capability = {};
        capability.type = this.checkValue(opts.type, "AlexaInterface");
        capability.interface = this.checkValue(opts.interface, "Alexa");
        capability.version = this.checkValue(opts.version, "3");
        const supported = this.checkValue(opts.supported, false);
        if (supported) {
            capability.properties = {};
            capability.properties.supported = supported;
            capability.properties.proactivelyReported = this.checkValue(opts.proactivelyReported, false);
            capability.properties.retrievable = this.checkValue(opts.retrievable, false);
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