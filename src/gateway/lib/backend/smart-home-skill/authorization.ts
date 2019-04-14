import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    errorResponse} from "../../../../common";
import {Backend} from "../../backend";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backend: Backend): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(backend: Backend): Promise<AlexaResponseContextProperty>[] {
    return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(alexaRequest: AlexaRequest, backend: Backend): AlexaResponse {
    return errorResponse(alexaRequest, "INTERNAL_ERROR", "");
}

export {capabilities, states, handler};