import {AlexaRequest} from "./alexa-request";
import {AlexaResponse} from "./alexa-response";

export function errorToErrorResponse(event: AlexaRequest, error: Error): AlexaResponse {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `${error.name}: ${error.message}`
    );
}

export function namespaceErrorResponse(event: AlexaRequest, namespace: string): AlexaResponse {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `You were sent to ${namespace} processing in error.`
    );
}

export function directiveErrorResponse(event: AlexaRequest, namespace: string): AlexaResponse {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `I do not know the ${namespace} directive ${event.directive.header.name}`
    );
}

export function errorResponse(event: AlexaRequest, type: string, message: string): AlexaResponse {
    const alexaResponse = new AlexaResponse({
        "alexaRequest": event,
        "name": "ErrorResponse",
        "payload": {
            "type": type,
            "message": message
        }
    });
    return alexaResponse.get();
}