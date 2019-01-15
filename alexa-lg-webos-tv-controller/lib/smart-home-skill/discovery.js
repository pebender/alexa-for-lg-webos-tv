const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const Gateway = require("../gateway-api/index.js");
const endpointHealth = require("./endpoint-health.js");
const powerController = require("./power-controller.js");
const rangeController = require("./range-controller.js");

function handler(event, callback) {
    if (event.directive.header.namespace !== "Alexa.Discovery") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": `You were sent to Discovery processing in error ${event.directive.header.namespace}.`
            }
        });
        callback(null, alexaResponse.get());
        return;
    }

    const gateway = new Gateway("x");
    const LGTVGatewayEndpoint = gatewayEndpoint(event);
    gateway.sendSkillDirective(event).then(
        (response) => {
console.log("hello");
            if (response.event.header.namespace === "Alexa.Discovery" &&
                response.event.header.name === "Discover.Response") {
console.log("hello again");
                const alexaResponse = new AlexaResponse(response);
                alexaResponse.addPayloadEndpoint(LGTVGatewayEndpoint);
                callback(null, alexaResponse.get());
                return;
            }
            const alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response"
            });
            alexaResponse.addPayloadEndpoint(LGTVGatewayEndpoint);
            callback(null, alexaResponse.get());
        },
        // eslint-disable-next-line no-unused-vars
        (error) => {
console.log("goodbye");
console.log(error);
            const alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response"
            });
            alexaResponse.addPayloadEndpoint(LGTVGatewayEndpoint);
            callback(null, alexaResponse.get());
        }
    );
}

// eslint-disable-next-line no-unused-vars
function gatewayEndpoint(event) {
    const capabilitiesAlexa = [AlexaResponse.createPayloadEndpointCapability()];
    const capabilitiesAlexaPowerController = powerController.capabilities(event);
    const capabilitiesAlexaEndpointHealth = endpointHealth.capabilities(event);
    const capabilitiesAlexaRangeController = rangeController.capabilities(event);

    const alexaEndpoint = AlexaResponse.createPayloadEndpoint({
        "endpointId": "lg-webos-tv-gateway",
        "friendlyName": "LGTV Gateway",
        "description": "LG webOS TV Gateway",
        "manufacturerName": "Paul Bender",
        "displayCategories": ["OTHER"],
        "capabilities": [
            ...capabilitiesAlexa,
            ...capabilitiesAlexaEndpointHealth,
            ...capabilitiesAlexaPowerController,
            ...capabilitiesAlexaRangeController
        ]
    });
    return alexaEndpoint;
}

module.exports = {"handler": handler};