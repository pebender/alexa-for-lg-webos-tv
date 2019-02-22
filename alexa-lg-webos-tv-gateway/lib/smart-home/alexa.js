const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("../common");

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
    return new Promise((resolve) => {
        resolve([]);
    });
}

function handler(lgtvControl, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa") {
            resolve(namespaceErrorResponse(event, "Alexa"));
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
        resolve(directiveErrorResponse(event, "Alexa"));
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};