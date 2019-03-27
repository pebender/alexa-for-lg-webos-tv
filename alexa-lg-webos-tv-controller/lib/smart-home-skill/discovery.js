const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {namespaceErrorResponse} = require("alexa-lg-webos-tv-common");
const Gateway = require("../gateway-api");
const alexa = require("./alexa");
const alexaEndpointHealth = require("./endpoint-health");
const alexaPowerController = require("./power-controller");
const alexaRangeController = require("./range-controller");

async function handler(event) {
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
async function gatewayEndpoint(event) {
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

module.exports = {"handler": handler};