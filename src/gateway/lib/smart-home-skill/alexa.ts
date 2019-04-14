import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../common";
import {BackendControl} from "../backend";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backendControl: BackendControl): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        Promise.resolve({
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        })
    ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(backend: BackendControl): Promise<AlexaResponseContextProperty>[] {
    return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reportStateHandler(alexaRequest: AlexaRequest, backendControl: BackendControl): AlexaResponse {
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "StateReport",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa"));
    }
    switch (alexaRequest.directive.header.name) {
        case "ReportState":
            return Promise.resolve(reportStateHandler(alexaRequest, backendControl));
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa"));
    }
}

export {capabilities, states, handler};