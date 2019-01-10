const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {sendSkillRequest} = require("./common.js");
const {unknownDirectiveError} = require("./common.js");
const authorization = require("./authorization.js");
const discovery = require("./discovery.js");
const powerController = require("./power-controller.js");
const rangeController = require("./range-controller.js");

// eslint-disable-next-line no-unused-vars
function skillHandler(event, _context, callback) {
    if (!(Reflect.has(event.directive, "endpoint") && Reflect.has(event.directive.endpoint, "endpointId"))) {
        switch (event.directive.header.namespace) {
            case "Alexa.Authorization":
                authorization.handler(event, (error, response) => callback(error, response));
                break;
            case "Alexa.Discovery":
                discovery.handler(event, (error, response) => callback(error, response));
                break;
            default:
                unknownDirectiveError(event, (error, response) => callback(error, response));
                break;
        }
    } else if (event.directive.endpoint.endpointId === "lg-webos-tv-gateway") {
        switch (event.directive.header.namespace) {
            case "Alexa.PowerController":
                powerController.handler(event, (error, response) => callback(error, response));
                break;
            case "Alexa.RangeController":
                rangeController.handler(event, (error, response) => callback(error, response));
                break;
            default:
                unknownDirectiveError(event, (error, response) => callback(error, response));
                break;
        }
    } else {
        remoteResponse(event, (error, response) => callback(error, response));
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

module.exports = {"handler": skillHandler};