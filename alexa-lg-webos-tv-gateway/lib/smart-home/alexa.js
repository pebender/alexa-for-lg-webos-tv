const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("../common");

// eslint-disable-next-line no-unused-vars
function capabilities(lgtvController, event, udn) {
    return new Promise((resolve) => {
        resolve({
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        });
    });
}

// eslint-disable-next-line no-unused-vars
function states(lgtvController, udn) {
    return new Promise((resolve) => {
        resolve([]);
    });
}

function handler(lgtvController, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa") {
            resolve(namespaceErrorResponse(event, "Alexa"));
            return;
        }

        switch (event.directive.header.name) {
            case "ReportState":
                resolve(reportStateHandler(lgtvController, event));
                break;
            default:
                resolve(unknownDirectiveError(lgtvController, event));
                break;
        }
    });
}

function reportStateHandler(lgtvController, event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "namespace": "Alexa",
            "name": "StateReport"
        });
        resolve(alexaResponse);
    });
}

function unknownDirectiveError(lgtvController, event) {
    return new Promise((resolve) => {
        resolve(directiveErrorResponse(event, "Alexa"));
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};