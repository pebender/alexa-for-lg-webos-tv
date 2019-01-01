const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_event) {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.PowerController",
            "version": "3"
        }
    ];
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
    callback(null, null);
}

function turnOnHandler(event, callback) {
    callback(null, null);
}

function unknownDirectiveError(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Power Controller directive ${event.directive.header.name}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "capabilities": capabilities,
    "handler": handler
};