const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv, _event, _udn) {
    return [
        {
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
        }
    ];
}

// eslint-disable-next-line no-unused-vars
function states(_lgtv, _udn) {
    return [];
}

function handler(lgtv, event) {
    if (event.directive.header.namespace !== "Alexa.PlaybackController") {
        return namespaceErrorResponse("Alexa.PlaybackController");
    }
    switch (event.directive.header.name) {
        case "Play":
            return playHandler(lgtv, event);
        case "Pause":
            return pauseHandler(lgtv, event);
        case "Stop":
            return stopHandler(lgtv, event);
        case "Rewind":
            return rewindHandler(lgtv, event);
        case "FastForward":
            return fastForwardHandler(lgtv, event);
        default:
            return directiveErrorResponse(lgtv, event);
    }
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

async function genericHandler(lgtv, event, commandURI) {
    const {endpointId} = event.directive.endpoint;
    const command = {
        "uri": commandURI
    };
    await lgtv.lgtvCommand(endpointId, command);
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    return alexaResponse.get();
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};