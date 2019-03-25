import {AlexaRequest,
    AlexaResponse,
    errorResponse} from "alexa-lg-webos-tv-common";
import {Backend} from "../../backend";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(_backend: Backend, alexaRequest: AlexaRequest): AlexaResponse {
    return errorResponse(alexaRequest, "INTERNAL_ERROR", "");
}

export {handler};