const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {namespaceErrorResponse, directiveErrorResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_event) {
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

function states() {
    const powerStateState = AlexaResponse.createContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": "OFF"
    });
    return [powerStateState];
}

function handler(event) {
    if (event.directive.header.namespace !== "Alexa.PowerController") {
        return namespaceErrorResponse(event, event.directive.header.namespace);
    }
    switch (event.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(event);
        case "TurnOn":
            return turnOnHandler(event);
        default:
            return directiveErrorResponse(event, event.directive.header.namespace);
    }
}

function turnOffHandler(event) {
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    return alexaResponse.get();
}

function turnOnHandler(event) {
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