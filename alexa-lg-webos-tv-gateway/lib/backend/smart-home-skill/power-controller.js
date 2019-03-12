const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("alexa-lg-webos-tv-common");

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

    const poweredOff = await lgtv.turnOff(endpointId);
    if (poweredOff === false) {
        return errorResponse(event, "INTERNAL_ERROR", `Alexa.PowerController.turnOff for LGTV ${endpointId} failed.`);

    }
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    return alexaResponse.get();
}

async function turnOnHandler(lgtv, event) {
    const {endpointId} = event.directive.endpoint;
    const poweredOn = await lgtv.turnOn(endpointId);
    if (poweredOn === false) {
        return errorResponse(event, "INTERNAL_ERROR", `Alexa.PowerController.turnOn for LGTV ${endpointId} failed.`);
    }
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    return alexaResponse.get();
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};