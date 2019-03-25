import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextPropertyInput,
    AlexaResponseEventPayloadEndpointCapabilityInput,
    directiveErrorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "../../backend";
import {UDN} from "../../common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_lbackendController: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
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
function states(_backendController: BackendController, _udn: UDN): AlexaResponseContextPropertyInput[] {
    return [];
}

async function genericHandler(backendController: BackendController, alexaRequest: AlexaRequest, commandURI: string): Promise<AlexaResponse> {
    const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
    const command = {
        "uri": commandURI
    };
    await backendController.lgtvCommand(udn, command);
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "Response"
    });
}

function playHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backendController, alexaRequest, "ssap://media.controls/play");
}

function pauseHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backendController, alexaRequest, "ssap://media.controls/pause");
}

function stopHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backendController, alexaRequest, "ssap://media.controls/stop");
}

function rewindHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backendController, alexaRequest, "ssap://media.controls/rewind");
}

function fastForwardHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return genericHandler(backendController, alexaRequest, "ssap://media.controls/fastForward");
}

function handler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PlaybackController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.PlaybackController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "Play":
            return playHandler(backendController, alexaRequest);
        case "Pause":
            return pauseHandler(backendController, alexaRequest);
        case "Stop":
            return stopHandler(backendController, alexaRequest);
        case "Rewind":
            return rewindHandler(backendController, alexaRequest);
        case "FastForward":
            return fastForwardHandler(backendController, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.PlaybackController"));
    }
}

export {capabilities, states, handler};