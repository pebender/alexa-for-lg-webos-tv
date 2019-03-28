import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_alexaRequest: AlexaRequest): AlexaResponseEventPayloadEndpointCapability[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

function states(): AlexaResponseContextProperty[] {
    return [];
}

function reportStateHandler(alexaRequest: AlexaRequest): AlexaResponse {
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "StateReport"
    });
}

function handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
    }

    switch (alexaRequest.directive.header.name) {
        case "ReportState":
            return Promise.resolve(reportStateHandler(alexaRequest));
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
    }
}

export {capabilities, states, handler};