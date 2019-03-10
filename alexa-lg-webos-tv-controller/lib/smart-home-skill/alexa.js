const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {namespaceErrorResponse, directiveErrorResponse} = require("alexa-lg-webos-tv-common");

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
        return namespaceErrorResponse(event, event.directive.header.namespace);
    }

    switch (event.directive.header.name) {
        case "ReportState":
            return reportStateHandler(event);
        default:
            return directiveErrorResponse(event, event.directive.header.namespace);
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