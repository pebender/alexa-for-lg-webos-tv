const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const Gateway = require("../gateway-api");
const alexa = require("./alexa");
const alexaEndpointHealth = require("./endpoint-health");
const alexaPowerController = require("./power-controller");
const alexaRangeController = require("./range-controller");

function handler(event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.Discovery") {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": `You were sent to Discovery processing in error ${event.directive.header.namespace}.`
                }
            });
            resolve(alexaResponse.get());
            return;
        }

        const gateway = new Gateway("x");
        let lgtvGatewayEndpoint = null;
        gatewayEndpoint(event).
        then((endpoint) => {
            lgtvGatewayEndpoint = endpoint;
            return gateway.sendSkillDirective(event);
        }).
        then((response) => {
            if (lgtvGatewayEndpoint === null) {
                resolve(response);
                return;
            }
            if (response.event.header.namespace === "Alexa.Discovery" &&
                response.event.header.name === "Discover.Response") {
                const alexaResponse = new AlexaResponse(response);
                alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
                resolve(alexaResponse.get());
                return;
            }
            const alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response"
            });
            alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
            resolve(alexaResponse.get());
        }).
        catch(() => {
            if (lgtvGatewayEndpoint === null) {
                resolve(null);
                return;
            }
            const alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response"
            });
            alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
            resolve(alexaResponse.get());
        });
    });
}

// eslint-disable-next-line no-unused-vars
function gatewayEndpoint(event) {
    return new Promise((resolve) => {
        Promise.all([
            alexa.capabilities(event),
            alexaPowerController.capabilities(event),
            alexaEndpointHealth.capabilities(event),
            alexaRangeController.capabilities(event)
        ]).
        then((capabilitiesList) => {
            // Convert from a two dimensional array to a one dimensional array.
            const capabilities = [].concat(...capabilitiesList);
            if (capabilities.length === 0) {
                resolve(null);
                return;
            }
            const endpoint = AlexaResponse.createPayloadEndpoint({
                "endpointId": "lg-webos-tv-gateway",
                "friendlyName": "LGTV Gateway",
                "description": "LG webOS TV Gateway",
                "manufacturerName": "Paul Bender",
                "displayCategories": ["OTHER"],
                "capabilities": capabilities
            });
            resolve(endpoint);
        }).
        catch(() => resolve(null));
    });
}

module.exports = {"handler": handler};