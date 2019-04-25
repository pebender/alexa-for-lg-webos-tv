import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../common";

function capabilities(): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [AlexaResponse.buildPayloadEndpointCapability({
        "namespace": "Alexa"
    })];
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