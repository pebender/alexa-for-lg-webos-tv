const {unknownDirectiveError} = require("./common.js");
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
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        const powerStateState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.PowerController",
            "name": "powerState",
            "value": "OFF"
        });
        resolve([powerStateState]);
    });
}

function handler(event, callback) {
    if (event.directive.header.namespace !== "Alexa.PowerController") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Power Controller processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    switch (event.directive.header.name) {
        case "TurnOff":
            turnOffHandler(event, (error, response) => callback(error, response));
            return;
        case "TurnOn":
            turnOnHandler(event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(event, (error, response) => callback(error, response));
    }
}

function turnOffHandler(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    callback(null, alexaResponse.get());
}

function turnOnHandler(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};