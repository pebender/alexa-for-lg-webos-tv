const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {unknownDirectiveError} = require("./common");

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

function handler(event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa") {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": "You were sent to Alexa processing in error."
                }
            });
            resolve(alexaResponse.get());
            return;
        }

        switch (event.directive.header.name) {
            case "ReportState":
                resolve(reportStateHandler(event));
                return;
            default:
                resolve(unknownDirectiveError(event));
        }
    });
}

function reportStateHandler(event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "namespace": "Alexa",
            "name": "StateReport"
        });
        resolve(alexaResponse);
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};