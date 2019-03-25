import {AlexaRequest,
    AlexaResponse,
    errorResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "../../backend";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(_backendController: BackendController, alexaRequest: AlexaRequest): AlexaResponse {
    return errorResponse(alexaRequest, "INTERNAL_ERROR", "");
}

export {handler};