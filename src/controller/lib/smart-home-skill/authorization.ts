import {AlexaRequest,
    AlexaResponse,
    errorResponse} from "../../../common";

function handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return Promise.resolve(errorResponse(alexaRequest, "INTERNAL_ERROR", "'Alexa.Authorization' is not supported."));
}

export {handler};