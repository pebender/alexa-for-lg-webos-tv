const {AlexaResponse} = require("alexa-lg-webos-tv-common");

function defaultAlexaResponse(event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event
        });
        resolve(alexaResponse.get());
    });
}

function createState(namespace, name, value) {
    return new Promise((resolve) => {
        resolve({
            "namespace": namespace,
            "name": name,
            "value": value
        });
    });
}

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
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": type,
                "message": message
            }
        });
        resolve(alexaResponse.get());
    });
}

function callbackToPromise(resolve, reject, error, response) {
    if (error) {
        reject(error);
        return;
    }
    resolve(response);
}

class GenericError extends Error {
    constructor(name, message) {
        super();

        const that = this;

        that.name = name;
        that.message = message;
    }
}

class UnititializedClassError extends GenericError {
    constructor(className, methodName) {

        super();

        const that = this;

        that.name = "UnitializedClass";
        that.message = `method '${methodName}' called but class '${className}' not initialized.`;
    }
}

module.exports = {
    "GenericError": GenericError,
    "UnititializedClassError": UnititializedClassError,
    "defaultAlexaResponse": defaultAlexaResponse,
    "createState": createState,
    "errorToErrorResponse": errorToErrorResponse,
    "namespaceErrorResponse": namespaceErrorResponse,
    "directiveErrorResponse": directiveErrorResponse,
    "errorResponse": errorResponse,
    "callbackToPromise": callbackToPromise
};