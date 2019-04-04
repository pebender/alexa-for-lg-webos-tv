import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../../common";
import {Backend} from "../../backend";
import {UDN} from "../../tv";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_backend: Backend, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapability[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(_backend: Backend, _udn: UDN): Promise<AlexaResponseContextProperty>[] {
    return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reportStateHandler(_backend: Backend, alexaRequest: AlexaRequest): AlexaResponse {
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "StateReport",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function unknownDirectiveError(_backend: Backend, alexaRequest: AlexaRequest): AlexaResponse {
    return directiveErrorResponse(alexaRequest, "Alexa");
}

function handler(backend: Backend, alexaRequest: AlexaRequest): AlexaResponse {
    if (alexaRequest.directive.header.namespace !== "Alexa") {
        return namespaceErrorResponse(alexaRequest, "Alexa");
    }
    switch (alexaRequest.directive.header.name) {
        case "ReportState":
            return reportStateHandler(backend, alexaRequest);
        default:
            return unknownDirectiveError(backend, alexaRequest);
    }
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};

export {capabilities, states, handler};