import * as alexa from "./alexa";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {AlexaRequest,
    AlexaResponse,
    AlexaResponseEventPayloadEndpoint,
    errorToErrorResponse,
    namespaceErrorResponse} from "../../../common";
import {Gateway} from "../gateway-api";

async function gatewayEndpoint(alexaRequest: AlexaRequest): Promise<AlexaResponseEventPayloadEndpoint | null> {
    try {
        const capabilities = await Promise.all([
            ...alexa.capabilities(alexaRequest),
            ...alexaPowerController.capabilities(alexaRequest),
            ...alexaEndpointHealth.capabilities(alexaRequest),
            ...alexaRangeController.capabilities(alexaRequest)
        ]);
        if (capabilities.length === 0) {
            return null;
        }
        const endpoint: AlexaResponseEventPayloadEndpoint = {
            "endpointId": "lg-webos-tv-gateway",
            "friendlyName": "LGTV Gateway",
            "description": "LG webOS TV Gateway",
            "manufacturerName": "Paul Bender",
            "displayCategories": ["OTHER"],
            "capabilities": []
        };
        capabilities.forEach((capability) => {
            if (typeof capability === "undefined" || capability === null) {
                return;
            }
            endpoint.capabilities.push(capability);
        });
        return endpoint;
    } catch (_error) {
        return null;
    }
}

async function handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Discovery") {
        return namespaceErrorResponse(alexaRequest, alexaRequest.directive.header.namespace);
    }

    const gateway: Gateway = new Gateway("");

    let alexaResponse: AlexaResponse | null = null;
    let lgtvGatewayEndpoint: AlexaResponseEventPayloadEndpoint | null = null;

    try {
        alexaResponse = await gateway.sendSkillDirective(alexaRequest);
    } catch (error) {
        alexaResponse = errorToErrorResponse(alexaRequest, error);
    }

    try {
        lgtvGatewayEndpoint = await gatewayEndpoint(alexaRequest);
    } catch (error) {
        lgtvGatewayEndpoint = null;
    }

    if (lgtvGatewayEndpoint === null) {
        return alexaResponse;
    }

    if (alexaResponse.event.header.namespace !== "Alexa.Discovery" ||
        alexaResponse.event.header.name !== "Discover.Response") {
        alexaResponse = new AlexaResponse({
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response"
        });
    }

    try {
        await alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }

    return alexaResponse;
}

export {handler};