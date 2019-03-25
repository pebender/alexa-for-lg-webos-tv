import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextPropertyInput,
    AlexaResponseEventPayloadEndpointCapabilityInput,
    directiveErrorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "../../backend";
import {UDN} from "../../common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_backendController: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(_backendController: BackendController, _udn: UDN): AlexaResponseContextPropertyInput[] {
    return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reportStateHandler(_backendController: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "StateReport"
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function unknownDirectiveError(_backendController: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    return directiveErrorResponse(alexaRequest, "Alexa");
}

function handler(backendController: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    if (alexaRequest.directive.header.namespace !== "Alexa") {
        return namespaceErrorResponse(alexaRequest, "Alexa");
    }
    switch (alexaRequest.directive.header.name) {
        case "ReportState":
            return reportStateHandler(backendController, alexaRequest);
        default:
            return unknownDirectiveError(backendController, alexaRequest);
    }
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};

export {capabilities, states, handler};