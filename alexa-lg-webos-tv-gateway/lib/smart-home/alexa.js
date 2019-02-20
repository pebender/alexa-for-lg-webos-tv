const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(lgtvControl, event, udn) {
    return new Promise((resolve) => {
        resolve({
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        });
    });
}

// eslint-disable-next-line no-unused-vars
function states(lgtvControl, udn) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        resolve([]);
    });
}

function handler(lgtvControl, event) {
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
                resolve(reportStateHandler(lgtvControl, event));
                break;
            default:
                resolve(unknownDirectiveError(lgtvControl, event));
                break;
        }
    });
}

function reportStateHandler(lgtvControl, event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "namespace": "Alexa",
            "name": "StateReport"
        });
        resolve(alexaResponse);
    });
}

function unknownDirectiveError(lgtvControl, event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": `I do not know the Alexa directive ${event.directive.header.name}`
            }
        });
        resolve(alexaResponse.get());
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};