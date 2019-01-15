const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {unknownDirectiveError} = require("./common.js");

// eslint-disable-next-line no-unused-vars
function capabilities(event) {
    return {
        "type": "AlexaInterface",
        "interface": "Alexa",
        "version": "3"
    };
}

// eslint-disable-next-line no-unused-vars
function states() {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        resolve([]);
    });
}

function handler(event, callback) {
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
            reportStateHandler(event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(event, (error, response) => callback(error, response));
    }
}

function reportStateHandler(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "namespace": "Alexa",
        "name": "StateReport"
    });
    callback(null, alexaResponse);
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};