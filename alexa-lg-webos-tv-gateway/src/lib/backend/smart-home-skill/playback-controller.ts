const {directiveErrorResponse, namespaceErrorResponse} = require("alexa-lg-webos-tv-common");
import {AlexaRequest, AlexaResponse} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _event: AlexaRequest, _udn: UDN) {
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
function states(_lgtv: BackendController, _udn: UDN): any[] {
    return [];
}

function handler(lgtv: BackendController, event: AlexaRequest) {
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

function playHandler(lgtv: BackendController, event: AlexaRequest) {
    return genericHandler(lgtv, event, "ssap://media.controls/play");
}

function pauseHandler(lgtv: BackendController, event: AlexaRequest) {
    return genericHandler(lgtv, event, "ssap://media.controls/pause");
}

function stopHandler(lgtv: BackendController, event: AlexaRequest) {
    return genericHandler(lgtv, event, "ssap://media.controls/stop");
}

function rewindHandler(lgtv: BackendController, event: AlexaRequest) {
    return genericHandler(lgtv, event, "ssap://media.controls/rewind");
}

function fastForwardHandler(lgtv: BackendController, event: AlexaRequest) {
    return genericHandler(lgtv, event, "ssap://media.controls/fastForward");
}

async function genericHandler(lgtv: BackendController, event: AlexaRequest, commandURI: string) {
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

export {capabilities, states, handler};