import {namespaceErrorResponse, directiveErrorResponse} from "alexa-lg-webos-tv-common";
import {AlexaRequest, AlexaResponse} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): {[x: string]: any}[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line no-unused-vars
function states(_lgtv: BackendController, _udn: UDN): {[x: string]: any}[] {
    return [];
}

function handler(lgtv: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    if (alexaRequest.directive.header.namespace !== "Alexa") {
        return namespaceErrorResponse(alexaRequest, "Alexa");
    }
    switch (alexaRequest.directive.header.name) {
        case "ReportState":
            return reportStateHandler(lgtv, alexaRequest);
        default:
            return unknownDirectiveError(lgtv, alexaRequest);
    }
}

function reportStateHandler(_lgtv: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "StateReport"
    });
}

function unknownDirectiveError(_lgtv: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    return directiveErrorResponse(alexaRequest, "Alexa");
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};

export {capabilities, states, handler};