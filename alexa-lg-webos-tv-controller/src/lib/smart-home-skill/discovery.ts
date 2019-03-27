import * as alexa from "./alexa";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {AlexaResponse, namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {Gateway} from "../gateway-api";

async function handler(event): Promise<any> {
    let lgtvGatewayEndpoint = null;
    try {
        if (event.directive.header.namespace !== "Alexa.Discovery") {
            return namespaceErrorResponse(event, event.directive.header.namespace);
        }

        const gateway = new Gateway("x");
        lgtvGatewayEndpoint = await gatewayEndpoint(event);
        const response = await gateway.sendSkillDirective(event);
        if (lgtvGatewayEndpoint === null) {
            return response;
        }
        if (response.event.header.namespace === "Alexa.Discovery" &&
            response.event.header.name === "Discover.Response") {
            const alexaResponse = new AlexaResponse(response);
            alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
            return alexaResponse;
        }
        const alexaResponse = new AlexaResponse({
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response"
        });
        alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
        return alexaResponse;
    } catch (_error) {
        if (lgtvGatewayEndpoint === null) {
            return null;
        }
        const alexaResponse = new AlexaResponse({
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response"
        });
        alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
        return alexaResponse;
    }
}

// eslint-disable-next-line no-unused-vars
async function gatewayEndpoint(event): Promise<any> {
    try {
        const capabilitiesList = await Promise.all([
            Promise.resolve(alexa.capabilities(event)),
            Promise.resolve(alexaPowerController.capabilities(event)),
            Promise.resolve(alexaEndpointHealth.capabilities(event)),
            Promise.resolve(alexaRangeController.capabilities(event))
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

export {handler};