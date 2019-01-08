const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(lgtvControl, event, udn) {
    return {
        "type": "AlexaInterface",
        "interface": "Alexa",
        "version": "3"
    };
}

// eslint-disable-next-line no-unused-vars
function states(lgtvControl, udn, callback) {
    callback(null, []);
}

function handler(lgtvControl, event, callback) {
    if (event.directive.header.namespace !== "Alexa") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Alexa processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }

    switch (event.directive.header.name) {
        case "ReportState":
            reportStateHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (error, response) => callback(error, response));
    }
}

function reportStateHandler(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "namespace": "Alexa",
        "name": "StateReport"
    });
    callback(null, alexaResponse);
}

function unknownDirectiveError(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Speaker directive ${event.directive.header.name}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};