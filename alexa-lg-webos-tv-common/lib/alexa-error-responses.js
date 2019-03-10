const {AlexaResponse} = require("./alexa-response");

function errorToErrorResponse(event, error) {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `${error.code}: ${error.message}`
    );
}

function namespaceErrorResponse(event, namespace) {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `You were sent to ${namespace} processing in error.`
    );
}

function directiveErrorResponse(event, namespace) {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `I do not know the ${namespace} directive ${event.directive.header.name}`
    );
}

function errorResponse(event, type, message) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": type,
            "message": message
        }
    });
    return alexaResponse.get();
}

module.exports = {
    "errorToErrorResponse": errorToErrorResponse,
    "namespaceErrorResponse": namespaceErrorResponse,
    "directiveErrorResponse": directiveErrorResponse,
    "errorResponse": errorResponse
};