import {errorResponse} from "alexa-lg-webos-tv-common";
import {AlexaRequest, AlexaResponse} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";

function handler(_backendController: BackendController, _udn: UDN, alexaRequest: AlexaRequest): AlexaResponse {
    return errorResponse(alexaRequest, "INTERNAL_ERROR", "");
}

export {handler};