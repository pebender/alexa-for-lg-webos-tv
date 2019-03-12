const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv, _event, _udn) {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.PowerController",
            "version": "3",
            "properties": {
                "supported": [
                    {
                        "name": "powerState"
                    }
                ],
                "proactivelyReported": false,
                "retrievable": true
            }
        }
    ];
}

function states(lgtv, udn) {
    const powerStateState = AlexaResponse.createContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": lgtv.getPowerState(udn)
    });
    return [powerStateState];
}

function handler(lgtv, event) {
    if (event.directive.header.namespace !== "Alexa.PowerController") {
        return namespaceErrorResponse(event, "Alexa.PowerController");
    }
    switch (event.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(lgtv, event);
        case "TurnOn":
            return turnOnHandler(lgtv, event);
        default:
            return directiveErrorResponse(lgtv, event);
    }
}

async function turnOffHandler(lgtv, event) {
    const {endpointId} = event.directive.endpoint;

    await lgtv.turnOff(endpointId);
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    return alexaResponse.get();
}

async function turnOnHandler(lgtv, event) {
    const {endpointId} = event.directive.endpoint;
    await lgtv.turnOn(endpointId);
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    console.log(JSON.stringify(event, null, 2));
    return alexaResponse.get();
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};