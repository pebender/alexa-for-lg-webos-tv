import {AlexaRequest} from "alexa-lg-webos-tv-common";
import {AlexaResponse} from "alexa-lg-webos-tv-common";
const {namespaceErrorResponse, directiveErrorResponse} = require("alexa-lg-webos-tv-common");
import {UDN} from "../../common";
import {BackendController} from "../../backend";

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _event: AlexaRequest, _udn: UDN) {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line no-unused-vars
function states(_lgtv: BackendController, _udn: UDN): any[] {
    return [];
}

function handler(lgtv: BackendController, event: AlexaRequest) {
    if (event.directive.header.namespace !== "Alexa") {
        return namespaceErrorResponse(event, "Alexa");
    }
    switch (event.directive.header.name) {
        case "ReportState":
            return reportStateHandler(lgtv, event);
        default:
            return unknownDirectiveError(lgtv, event);
    }
}

function reportStateHandler(_lgtv: BackendController, event: AlexaRequest): AlexaResponse {
    const alexaResponse = new AlexaResponse({
        "alexaRequest": event,
        "namespace": "Alexa",
        "name": "StateReport"
    });
    return alexaResponse.get();
}

function unknownDirectiveError(_lgtv: BackendController, event: AlexaRequest) {
    return directiveErrorResponse(event, "Alexa");
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};

export {capabilities, states, handler};