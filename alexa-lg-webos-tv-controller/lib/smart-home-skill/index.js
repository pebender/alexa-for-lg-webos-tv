const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const Gateway = require("../gateway-api");
const {unknownDirectiveError} = require("./common.js");
const authorization = require("./authorization.js");
const discovery = require("./discovery.js");
const endpointHealth = require("./endpoint-health.js");
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
            case "Alexa.EndpointHealth":
                endpointHealth.handler(event, (error, response) => callback(error, response));
                break;
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
    const gateway = new Gateway("x");
    gateway.sendSkillDirective(event).then(
        (response) => callback(null, response),
        (error) => {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": `${error.name}: ${error.message}.`
                }
            });
            callback(null, alexaResponse.get());
        }
    );
}

module.exports = {"handler": skillHandler};