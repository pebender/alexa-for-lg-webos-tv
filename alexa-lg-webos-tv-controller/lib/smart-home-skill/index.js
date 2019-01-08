const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {sendSkillRequest} = require("./common.js");
const authorization = require("./authorization.js");
const discovery = require("./discovery.js");
const powerController = require("./power-controller.js");
const rangeController = require("./range-controller.js");

// eslint-disable-next-line no-unused-vars
function skillHandler(event, _context, callback) {

    remoteResponse(event, (error, response) => callback(error, response));
    return;

    // eslint-disable-next-line no-unreachable
    if (Reflect.has(event, "directive") &&
        Reflect.has(event.directive, "endpoint") &&
        Reflect.has(event.directive.endpoint, "endpointId")) {
        if (event.directive.endpoint.endpointId === "lg-webos-tv-gateway") {
            switch (event.directive.header.namespace) {
                case "xAlexa.PowerController":
                    powerController.handler(event, (error, response) => callback(error, response));
                    break;
                case "xAlexa.RangeController":
                    rangeController.handler(event, (error, response) => callback(error, response));
                    break;
                default:
                    unknownDirectiveError(event, (error, response) => callback(error, response));
                    break;
            }
        } else {
            remoteResponse(event, (error, response) => callback(error, response));
        }
    } else {
        switch (event.directive.header.namespace) {
            case "xAlexa.Authorization":
                authorization.handler(event, (error, response) => callback(error, response));
                break;
            case "Alexa.Discovery":
                discovery.handler(event, (error, response) => callback(error, response));
                break;
            default:
                remoteResponse(event, (error, response) => callback(error, response));
                break;
        }
    }
}

function remoteResponse(event, callback) {
    sendSkillRequest(event, (error, response) => {
        if (error) {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": `${error.name}: ${error.message}.`
                }
            });
            callback(null, alexaResponse.get());
            return;
        }
        callback(null, response);
    });
}

function unknownDirectiveError(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the directive ${event.directive.header.namespace}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {"handler": skillHandler};