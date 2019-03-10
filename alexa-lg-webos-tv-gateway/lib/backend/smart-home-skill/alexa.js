const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {namespaceErrorResponse, directiveErrorResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv, _event, _udn) {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line no-unused-vars
function states(_lgtv, _udn) {
    return [];
}

function handler(lgtv, event) {
    if (event.directive.header.namespace !== "Alexa") {
        return namespaceErrorResponse(event, "Alexa");
    }
    switch (event.directive.header.name) {
        case "ReportState":
            return reportStateHandler(lgtv, event);
        default:
            return unknownDirectiveError(lgtv, event);
    }
}

function reportStateHandler(_lgtv, event) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "namespace": "Alexa",
        "name": "StateReport"
    });
    return alexaResponse.get();
}

function unknownDirectiveError(_lgtv, event) {
    return directiveErrorResponse(event, "Alexa");
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};