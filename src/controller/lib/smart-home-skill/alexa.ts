import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        Promise.resolve({
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        })
    ];
}

function states(): Promise<AlexaResponseContextProperty>[] {
    return [];
}

function reportStateHandler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return Promise.resolve(new AlexaResponse({
        "namespace": "Alexa",
        "name": "StateReport",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    }));
}

function handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
    }

    switch (alexaRequest.directive.header.name) {
    case "ReportState":
        return reportStateHandler(alexaRequest);
    default:
        return Promise.resolve(directiveErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
    }
}

export {capabilities, states, handler};