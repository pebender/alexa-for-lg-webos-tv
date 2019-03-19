import {AlexaRequest} from "./alexa-request";
import {AlexaHeader, AlexaEndpoint} from "./alexa-base";
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

export class AlexaResponseContextProperty {
    namespace: string;
    name: string;
    instance?: string;
    value: any;
    timeOfSample: string;
    uncertaintyInMilliseconds: number;
    constructor(opts: {
        namespace?: string,
        name?: string,
        instance?: string,
        value?: any,
        timeOfSample?: string,
        uncertaintyInMilliseconds?: number
    }) {
        this.namespace = Reflect.has(opts, "namespace") && opts.namespace !== ""
            ? <string>opts.namespace
            : "Alexa.EndpointHealth";
        this.name = Reflect.has(opts, "name") && opts.name !== ""
            ? <string>opts.name
            : "connectivity";
        this.value = Reflect.has(opts, "value") && opts.value !== {}
            ? opts.value
            : {"value": "OK"};
        this.timeOfSample = new Date().toISOString(),
        this.uncertaintyInMilliseconds = Reflect.has(opts, "uncertaintyInMilliseconds")
            ? <number>opts.uncertaintyInMilliseconds
            : 0;
        if (Reflect.has(opts, "instance")) {
            this.instance = opts.instance;
        }
    }
}

class AlexaResponseContext {
    properties?: AlexaResponseContextProperty[];
    constructor(opts: {
        namespace?: string,
        name?: string,
        instance?: string,
        value?: any,
        timeOfSample?: string,
        uncertaintyInMilliseconds?: number
    }) {
        this.addProperty(opts);
    }
    addProperty(opts: {
        namespace?: string,
        name?: string,
        instance?: string,
        value?: any,
        timeOfSample?: string,
        uncertaintyInMilliseconds?: number
    }){
        if (Reflect.has(this, "properties") === false) {
            this.properties = [];
        }
        (<AlexaResponseContextProperty[]>this.properties).push(new AlexaResponseContextProperty(opts));
    }
}

export class AlexaResponseEventPayloadEndpointCapability {
    type: string;
    interface: string;
    version: string;
    supported?: boolean;
    properties?: {
        supported: boolean,
        proactivelyReported: boolean,
        retrievable: boolean
    };
    constructor(opts: {
        type?: string,
        interface?: string,
        version?: string,
        supported?: boolean,
        proactivelyReported?: boolean,
        retrievable?: boolean
    }) {
        this.type = Reflect.has(opts, "type") && opts.type !== ""
            ? <string>opts.type
            : "AlexaInterface";
        this.interface = Reflect.has(opts, "interface") && opts.interface !== ""
            ? <string>opts.interface
            : "Alexa";
        this.version = Reflect.has(opts, "version") && opts.version !== ""
            ? <string>opts.version
            : "3";
        if (Reflect.has(opts, "supported") && opts.supported) {
            this.properties = {
                supported: true,
                proactivelyReported: Reflect.has(opts, "proactivelyReported")
                    ? <boolean>opts.proactivelyReported
                    : false,
                retrievable: Reflect.has(opts, "retrievable")
                    ? <boolean>opts.retrievable
                    : false
            };
        }
    }
}

export class AlexaResponseEventPayloadEndpoint {
    capabilities: AlexaResponseEventPayloadEndpointCapability[];
    description: string;
    displayCategories: string[];
    endpointId: string;
    friendlyName: string;
    manufacturerName: string;
    cookie?: {[x: string]: any};
    constructor(opts: {
        capabilities?: any[],
        description?: string,
        displayCategories?: string[],
        endpointId?: string,
        friendlyName?: string,
        manufacturerName?: string
        cookie?: {[x: string]: any}
    }) {
        this.capabilities = Reflect.has(opts, "capabilities")
            ? <AlexaResponseEventPayloadEndpointCapability[]>opts.capabilities
            : [];
        this.description = Reflect.has(opts, "description") && opts.description !== ""
            ? <string>opts.description
            : "Sample Endpoint Description";
        this.displayCategories = Reflect.has(opts, "displayCategories")
            ? <string[]>opts.displayCategories
            : ["OTHER"];
        this.endpointId = Reflect.has(opts, "endpointId") && opts.endpointId !== ""
            ? <string>opts.endpointId
            : "endpoint-001";
        this.friendlyName = Reflect.has(opts, "friendlyName") && opts.friendlyName !== ""
            ? <string>opts.friendlyName
            : "Sample Endpoint";
        this.manufacturerName = Reflect.has(opts, "manufacturerName") && opts.manufacturerName !== ""
            ? <string>opts.manufacturerName
            : "Sample Manufacturer"
        if (Reflect.has(opts, "cookie")) {
            this.cookie = opts.cookie;
        }
    }
    addCapability(opts: {
        type?: string,
        interface?: string,
        version?: string,
        supported?: boolean,
        proactivelyReported?: boolean,
        retrievable?: boolean
    }) {
        this.capabilities.push(new AlexaResponseEventPayloadEndpointCapability(opts));
    }
}

class AlexaResponseEventPayload {
    endpoints?: AlexaResponseEventPayloadEndpoint[];
    constructor({}) {

    }
    addEndpoint(opts: {}) {
        if (!Reflect.has(this, "endpoints")) {
            this.endpoints = [];
        }
        (<AlexaResponseEventPayloadEndpoint[]>this.endpoints).push(new AlexaResponseEventPayloadEndpoint(opts));
    }
}

class AlexaResponseEvent {
    static Header: typeof AlexaHeader;
    static Endpoint?: typeof AlexaResponseEvent;
    header: AlexaHeader;
    endpoint?: AlexaEndpoint;
    payload: AlexaResponseEventPayload | {};
    constructor(opts: {
        alexaRequest?: AlexaRequest,
        namespace?: string,
        name?: string,
        messageId?: string,
        payloadVersion?: string,
        token?: any,
        endpointId?: string,
        payload: AlexaResponseEventPayload,
        correlationToken?: string,
        instance?: string
    }) {
        this.header = new AlexaHeader({
            "alexaRequest": opts.alexaRequest,
            "namespace": opts.namespace,
            "name": opts.name,
            "messageId": opts.messageId,
            "payloadVersion": opts.payloadVersion,
            "correlationToken": opts.correlationToken,
            "instance": opts.instance
        });
        // No endpoint in an AcceptGrant or Discover request
        if ((this.header.name === "AcceptGrant.Response") === false &&
            (this.header.name === "Discover.Response") === false) {
            this.endpoint = new AlexaEndpoint({
                token: opts.token,
                endpointId: opts.token,
            });
        }
        this.payload = Reflect.has(opts, "payload")
            ? <AlexaResponseEventPayload>opts.payload
            : {}
    }
}

export class AlexaResponse {
    context?: AlexaResponseContext;
    event: AlexaResponseEvent;
    constructor(opts: {
        alexaRequest?: AlexaRequest,
        context?: AlexaResponseContext,
        event?: AlexaResponseEvent,
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
            this.event = <AlexaResponseEvent>opts.event;
        } else {
            this.event = {
                "header": new AlexaHeader({
                    "alexaRequest": opts.alexaRequest,
                    "namespace": opts.namespace,
                    "name": opts.name,
                    "messageId": opts.messageId,
                    "payloadVersion": opts.payloadVersion,
                    "correlationToken": opts.correlationToken,
                    "instance": opts.instance
                }),
                "endpoint": new AlexaEndpoint({
                    token: opts.token,
                    endpointId: opts.token,
                }),
                "payload": Reflect.has(opts, "payload") && opts.payload !== {}
                    ? opts.payload
                    : {}
            };
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
            this.context = new AlexaResponseContext({});
        }
        (<AlexaResponseContext>this.context).addProperty(opts);
    }

    addPayloadEndpoint(opts: {
        capabilities?: any[],
        description?: string,
        displayCategories?: string[],
        endpointId?: string,
        friendlyName?: string,
        manufacturerName?: string,
        cookie?: {[x: string]: any}
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
        const property = new AlexaPayloadEndpoint(opts);

        this.event.payload.endpoints.push(property);
    }

    get() {
        return this;
    }
}