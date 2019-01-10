const {sendSkillRequest} = require("./common.js");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");
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

    let alexaResponse = null;
    sendSkillRequest(event, (error, response) => {
        if (error) {
            alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response"
            });
            const LGTVGatewayEndpoint = gatewayEndpoint(event);
            alexaResponse.addPayloadEndpoint(LGTVGatewayEndpoint);
            callback(null, alexaResponse.get());
            return;
        }
        if (response.event.header.namespace === "Alexa.Discovery") {
            alexaResponse = new AlexaResponse(response);
        } else {
            alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response"
            });
        }
        const LGTVGatewayEndpoint = gatewayEndpoint(event);
        alexaResponse.addPayloadEndpoint(LGTVGatewayEndpoint);
        callback(null, alexaResponse.get());
    });
}

// eslint-disable-next-line no-unused-vars
function gatewayEndpoint(event) {
    const capabilitiesAlexa = [AlexaResponse.createPayloadEndpointCapability()];
    const capabilitiesAlexaPowerController = powerController.capabilities(event);
    const capabilitiesAlexaRangeController = rangeController.capabilities(event);

    const alexaEndpoint = AlexaResponse.createPayloadEndpoint({
        "endpointId": "lg-webos-tv-gateway",
        "friendlyName": "LGTV Gateway",
        "description": "LG webOS TV Gateway",
        "manufacturerName": "Paul Bender",
        "displayCategories": ["OTHER"],
        "capabilities": [
            ...capabilitiesAlexa,
            ...capabilitiesAlexaPowerController,
            ...capabilitiesAlexaRangeController
        ]
    });
    return alexaEndpoint;
}

module.exports = {"handler": handler};