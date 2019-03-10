const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {unknownDirectiveError} = require("./common");

// eslint-disable-next-line no-unused-vars
function capabilities(_event) {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

function states() {
    return [];
}

function handler(event) {
    if (event.directive.header.namespace !== "Alexa") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Alexa processing in error."
            }
        });
        return alexaResponse.get();
    }

    switch (event.directive.header.name) {
        case "ReportState":
            return reportStateHandler(event);
        default:
            return unknownDirectiveError(event);
    }
}

function reportStateHandler(event) {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "namespace": "Alexa",
            "name": "StateReport"
        });
        return alexaResponse;
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};