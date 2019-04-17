import {AlexaRequest} from "./alexa-request";
import {AlexaResponse} from "./alexa-response";

export function errorResponse(alexaRequest: AlexaRequest | null, type: string, message: string): AlexaResponse {
    if (alexaRequest !== null) {
        return new AlexaResponse({
            "namespace": "Alexa",
            "name": "ErrorResponse",
            "correlationToken": alexaRequest.getCorrelationToken(),
            "endpointId": alexaRequest.getEndpointId(),
            "payload": {
                "type": type,
                "message": message
            }
        });
    }
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "ErrorResponse",
        "payload": {
            "type": type,
            "message": message
        }
    });
}

export function errorToErrorResponse(alexaRequest: AlexaRequest, error: Error): AlexaResponse {
    return errorResponse(
        alexaRequest,
        "INTERNAL_ERROR",
        error.toString()
    );
}

export function namespaceErrorResponse(alexaRequest: AlexaRequest, namespace: string): AlexaResponse {
    return errorResponse(
        alexaRequest,
        "INTERNAL_ERROR",
        `You were sent to ${namespace} processing in error.`
    );
}

export function directiveErrorResponse(alexaRequest: AlexaRequest, namespace: string): AlexaResponse {
    return errorResponse(
        alexaRequest,
        "INTERNAL_ERROR",
        `I do not know the ${namespace} directive ${alexaRequest.directive.header.name}`
    );
}