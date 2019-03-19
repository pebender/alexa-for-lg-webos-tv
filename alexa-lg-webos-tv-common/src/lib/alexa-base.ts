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
import {AlexaRequest} from "./alexa-request";

export class AlexaHeader {
    namespace: string;
    name: string;
    messageId: string;
    payloadVersion: string;
    correlationToken?: string;
    instance?: string;
    constructor(opts: {
        alexaRequest?: AlexaRequest;
        namespace?: string,
        name?: string,
        messageId?: string,
        payloadVersion?: string,
        correlationToken? : string
        instance?: string
    }) {
        const alts: {correlationToken?: string} = {
            correlationToken: opts.correlationToken
        }
        if (Reflect.has(alts, "correlationToken") === false) {
            if (Reflect.has(opts, "alexaRequest")) {
                const alexaRequest = <AlexaRequest>opts.alexaRequest;
                if (Reflect.has(alexaRequest.directive.header, "correlationToken")) {
                    alts.correlationToken = alexaRequest.directive.header.correlationToken;
                }
            }
        }
        this.namespace = Reflect.has(opts, "namespace") && opts.namespace !== ""
            ? <string>opts.namespace
            : "Alexa";
        this.name = Reflect.has(opts, "name") && opts.name !== ""
            ? <string>opts.name
            : "Response";
        this.messageId = Reflect.has(opts, "messageId") && opts.messageId !== ""
            ? <string>opts.messageId
            : uuid();
        this.payloadVersion = Reflect.has(opts, "payloadVersion") && opts.payloadVersion !== ""
            ? <string>opts.payloadVersion
            : "3";
        if (Reflect.has(alts, "correlationToken")) {
            this.correlationToken = alts.correlationToken;
        }
    }
}

class AlexaScope {
    type: "BearerToken";
    token: string;
    constructor(opts: {
        token: string
    }) {
        this.type = "BearerToken";
        this.token = opts.token;
    }
}

export class AlexaEndpoint {
    static Scope: typeof AlexaScope;
    scope: AlexaScope | "INVALID";
    endpointId: string | "INVALID";
    cookie?: {[x: string]: any};
    constructor(opts: {
        alexaRequest?: AlexaRequest,
        endpointId?: string,
        token?: string
        cookie?: {[x: string]: any}
    }) {
        const alts: AlexaEndpoint = {
            scope: "INVALID",
            endpointId: "INVALID"
        };
        if (Reflect.has(opts, "alexaRequest")) {
            const alexaRequest = <AlexaRequest>opts.alexaRequest;
            if (Reflect.has(alexaRequest.directive, "endpoint")) {
                const endpoint = <AlexaEndpoint>alexaRequest.directive.endpoint;
                alts.endpointId = endpoint.endpointId;
            }
        }
        this.scope = Reflect.has(opts, "token") && opts.token !== ""
            ? new AlexaEndpoint.Scope({
                token: <string>opts.token
            })
            : "INVALID";
        this.endpointId = Reflect.has(opts, "endpointId") && opts.endpointId !== ""
            ? <string>opts.endpointId
            : alts.endpointId;
        if (Reflect.has(opts, "cookie")) {
            this.cookie = opts.cookie;
        }
    }
}