const {unknownDirectiveError} = require("./common");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");

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
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Power Controller processing in error."
            }
        });
        return alexaResponse.get();
    }
    switch (event.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(event);
        case "TurnOn":
            return turnOnHandler(event);
        default:
            return unknownDirectiveError(event);
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