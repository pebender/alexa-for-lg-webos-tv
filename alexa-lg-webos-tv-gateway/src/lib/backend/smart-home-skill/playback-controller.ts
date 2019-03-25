import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextPropertyInput,
    AlexaResponseEventPayloadEndpointCapabilityInput,
    directiveErrorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {Backend} from "../../backend";
import {UDN} from "../../common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_backend: Backend, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(_backend: Backend, _udn: UDN): AlexaResponseContextPropertyInput[] {
    return [];
}

async function genericHandler(backend: Backend, alexaRequest: AlexaRequest, commandURI: string): Promise<AlexaResponse> {
    const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
    const command = {
        "uri": commandURI
    };
    await backend.lgtvCommand(udn, command);
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "Response"
    });
}

function playHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backend, alexaRequest, "ssap://media.controls/play");
}

function pauseHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backend, alexaRequest, "ssap://media.controls/pause");
}

function stopHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backend, alexaRequest, "ssap://media.controls/stop");
}

function rewindHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backend, alexaRequest, "ssap://media.controls/rewind");
}

function fastForwardHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backend, alexaRequest, "ssap://media.controls/fastForward");
}

function handler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PlaybackController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.PlaybackController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "Play":
            return playHandler(backend, alexaRequest);
        case "Pause":
            return pauseHandler(backend, alexaRequest);
        case "Stop":
            return stopHandler(backend, alexaRequest);
        case "Rewind":
            return rewindHandler(backend, alexaRequest);
        case "FastForward":
            return fastForwardHandler(backend, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.PlaybackController"));
    }
}

export {capabilities, states, handler};