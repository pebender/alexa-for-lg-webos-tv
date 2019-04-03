import {AlexaRequest} from "./alexa-request";
import {AlexaResponse} from "./alexa-response";

export function errorResponse(event: AlexaRequest, type: string, message: string): AlexaResponse {
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "ErrorResponse",
        "correlationToken": event.getCorrelationToken(),
        "endpointId": event.getEndpointId(),
        "payload": {
            "type": type,
            "message": message
        }
    });
}

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