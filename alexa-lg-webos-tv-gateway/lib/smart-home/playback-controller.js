const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("../common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvController, _event, _udn) {
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
function states(lgtvController, udn) {
    return new Promise((resolve) => {
        resolve([]);
    });
}

function handler(lgtvController, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.PlaybackController") {
            resolve(namespaceErrorResponse("Alexa.PlaybackController"));
            return;
        }
        switch (event.directive.header.name) {
            case "Play":
                resolve(playHandler(lgtvController, event));
                break;
            case "Pause":
                resolve(pauseHandler(lgtvController, event));
                break;
            case "Stop":
                resolve(stopHandler(lgtvController, event));
                break;
            case "Rewind":
                resolve(rewindHandler(lgtvController, event));
                break;
            case "FastForward":
                resolve(fastForwardHandler(lgtvController, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtvController, event));
                break;
        }
    });
}

function playHandler(lgtvController, event) {
    return genericHandler(lgtvController, event, "ssap://media.controls/play");
}

function pauseHandler(lgtvController, event) {
    return genericHandler(lgtvController, event, "ssap://media.controls/pause");
}

function stopHandler(lgtvController, event) {
    return genericHandler(lgtvController, event, "ssap://media.controls/stop");
}

function rewindHandler(lgtvController, event) {
    return genericHandler(lgtvController, event, "ssap://media.controls/rewind");
}

function fastForwardHandler(lgtvController, event) {
    return genericHandler(lgtvController, event, "ssap://media.controls/fastForward");
}

function genericHandler(lgtvController, event, commandURI) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;
        const command = {
            "uri": commandURI
        };
        resolve(lgtvController.lgtvCommand(endpointId, command).
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