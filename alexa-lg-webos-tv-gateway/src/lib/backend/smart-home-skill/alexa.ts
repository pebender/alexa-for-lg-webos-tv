import {namespaceErrorResponse, directiveErrorResponse} from "alexa-lg-webos-tv-common";
import {AlexaRequest, AlexaResponse, AlexaResponseEventPayloadEndpointCapabilityInput, AlexaResponseContextPropertyInput} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";

// eslint-disable-next-line no-unused-vars
function capabilities(_backendController: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line no-unused-vars
function states(_backendController: BackendController, _udn: UDN): AlexaResponseContextPropertyInput[] {
    return [];
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

function reportStateHandler(_backendController: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "StateReport"
    });
}

function unknownDirectiveError(_backendController: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    return directiveErrorResponse(alexaRequest, "Alexa");
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};

export {capabilities, states, handler};