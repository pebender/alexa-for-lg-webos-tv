const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("../../common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv, _event, _udn) {
    return new Promise((resolve) => {
        resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.PlaybackController",
            "version": "3",
            "supportedOperations": [
                "Play",
                "Pause",
                "Stop",
                "Rewind",
                "FastForward"
            ]
        });
    });
}

// eslint-disable-next-line no-unused-vars
function states(_lgtv, _udn) {
    return new Promise((resolve) => {
        resolve([]);
    });
}

function handler(lgtv, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.PlaybackController") {
            resolve(namespaceErrorResponse("Alexa.PlaybackController"));
            return;
        }
        switch (event.directive.header.name) {
            case "Play":
                resolve(playHandler(lgtv, event));
                break;
            case "Pause":
                resolve(pauseHandler(lgtv, event));
                break;
            case "Stop":
                resolve(stopHandler(lgtv, event));
                break;
            case "Rewind":
                resolve(rewindHandler(lgtv, event));
                break;
            case "FastForward":
                resolve(fastForwardHandler(lgtv, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtv, event));
                break;
        }
    });
}

function playHandler(lgtv, event) {
    return genericHandler(lgtv, event, "ssap://media.controls/play");
}

function pauseHandler(lgtv, event) {
    return genericHandler(lgtv, event, "ssap://media.controls/pause");
}

function stopHandler(lgtv, event) {
    return genericHandler(lgtv, event, "ssap://media.controls/stop");
}

function rewindHandler(lgtv, event) {
    return genericHandler(lgtv, event, "ssap://media.controls/rewind");
}

function fastForwardHandler(lgtv, event) {
    return genericHandler(lgtv, event, "ssap://media.controls/fastForward");
}

function genericHandler(lgtv, event, commandURI) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;
        const command = {
            "uri": commandURI
        };
        resolve(lgtv.lgtvCommand(endpointId, command).
            then(() => {
                const alexaResponse = new AlexaResponse({
                    "request": event
                });
                return alexaResponse.get();
            }));
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};