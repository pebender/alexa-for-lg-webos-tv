import {AlexaRequest,
    AlexaResponse,
    errorResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "../../backend";

function handler(_backendController: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    return errorResponse(alexaRequest, "INTERNAL_ERROR", "");
}

export {handler};