import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    LGTVRequest,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../../common";
import {BackendControl} from "../../backend";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backendControl: BackendControl): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        Promise.resolve({
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
        })
    ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(backendControl: BackendControl): Promise<AlexaResponseContextProperty>[] {
    return [];
}

async function genericHandler(alexaRequest: AlexaRequest, backendControl: BackendControl, lgtvRequestURI: string): Promise<AlexaResponse> {
    const lgtvRequest: LGTVRequest = {
        "uri": lgtvRequestURI
    };
    await backendControl.lgtvCommand(lgtvRequest);
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PlaybackController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.PlaybackController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "Play":
            return genericHandler(alexaRequest, backendControl, "ssap://media.controls/play");
        case "Pause":
            return genericHandler(alexaRequest, backendControl, "ssap://media.controls/pause");
        case "Stop":
            return genericHandler(alexaRequest, backendControl, "ssap://media.controls/stop");
        case "Rewind":
            return genericHandler(alexaRequest, backendControl, "ssap://media.controls/rewind");
        case "FastForward":
            return genericHandler(alexaRequest, backendControl, "ssap://media.controls/fastForward");
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.PlaybackController"));
    }
}

export {capabilities, states, handler};