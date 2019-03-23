import {directiveErrorResponse, namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {AlexaRequest, AlexaResponse, AlexaResponseEventPayloadEndpointCapabilityInput, AlexaResponseContextPropertyInput} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
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
function states(_lgtv: BackendController, _udn: UDN): AlexaResponseContextPropertyInput[] {
    return [];
}

function handler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PlaybackController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.PlaybackController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "Play":
            return playHandler(lgtv, alexaRequest);
        case "Pause":
            return pauseHandler(lgtv, alexaRequest);
        case "Stop":
            return stopHandler(lgtv, alexaRequest);
        case "Rewind":
            return rewindHandler(lgtv, alexaRequest);
        case "FastForward":
            return fastForwardHandler(lgtv, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.PlaybackController"));
    }
}

function playHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(lgtv, alexaRequest, "ssap://media.controls/play");
}

function pauseHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(lgtv, alexaRequest, "ssap://media.controls/pause");
}

function stopHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(lgtv, alexaRequest, "ssap://media.controls/stop");
}

function rewindHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(lgtv, alexaRequest, "ssap://media.controls/rewind");
}

function fastForwardHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(lgtv, alexaRequest, "ssap://media.controls/fastForward");
}

async function genericHandler(lgtv: BackendController, alexaRequest: AlexaRequest, commandURI: string): Promise<AlexaResponse> {
    const {endpointId} = alexaRequest.directive.endpoint;
    const command = {
        "uri": commandURI
    };
    await lgtv.lgtvCommand(endpointId, command);
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "Response"
    });
}

export {capabilities, states, handler};