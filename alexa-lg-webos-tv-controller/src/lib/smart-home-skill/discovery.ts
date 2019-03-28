import * as alexa from "./alexa";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {AlexaRequest,
    AlexaResponse,
    AlexaResponseEventPayloadEndpoint,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {Gateway} from "../gateway-api";

async function gatewayEndpoint(alexaRequest: AlexaRequest): Promise<AlexaResponseEventPayloadEndpoint> {
    try {
        const capabilitiesList = await Promise.all([
            Promise.resolve(alexa.capabilities(alexaRequest)),
            Promise.resolve(alexaPowerController.capabilities(alexaRequest)),
            Promise.resolve(alexaEndpointHealth.capabilities(alexaRequest)),
            Promise.resolve(alexaRangeController.capabilities(alexaRequest))
        ]);
        // Convert from a two dimensional array to a one dimensional array.
        const capabilities = [].concat(...capabilitiesList);
        if (capabilities.length === 0) {
            return null;
        }
        const endpoint = AlexaResponse.createPayloadEndpoint({
            "endpointId": "lg-webos-tv-gateway",
            "friendlyName": "LGTV Gateway",
            "description": "LG webOS TV Gateway",
            "manufacturerName": "Paul Bender",
            "displayCategories": ["OTHER"],
            "capabilities": capabilities
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

    let alexaResponse = null;
    let lgtvGatewayEndpoint = null;

    try {
        const gateway = new Gateway("");
        alexaResponse = await gateway.sendSkillDirective(alexaRequest);
    } catch (error) {
        alexaResponse = null;
    }

    try {
        lgtvGatewayEndpoint = await gatewayEndpoint(alexaRequest);
    } catch (error) {
        lgtvGatewayEndpoint = null;
    }

    if (lgtvGatewayEndpoint === null) {
        return alexaResponse;
    }

    if ((alexaResponse.event.header.namespace === "Alexa.Discovery" &&
        alexaResponse.event.header.name === "Discover.Response") === false) {
        alexaResponse = new AlexaResponse({
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response"
        });
    }

    alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
    return alexaResponse;
}

export {handler};