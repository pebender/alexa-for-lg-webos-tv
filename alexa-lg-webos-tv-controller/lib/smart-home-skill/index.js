const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const Gateway = require("../gateway-api");
const {unknownDirectiveError} = require("./common.js");
const alexaAuthorization = require("./authorization.js");
const alexaDiscovery = require("./discovery.js");
const alexa = require("./alexa.js");
const alexaEndpointHealth = require("./endpoint-health.js");
const alexaPowerController = require("./power-controller.js");
const alexaRangeController = require("./range-controller.js");

// eslint-disable-next-line no-unused-vars
function skillHandler(event, _context, callback) {
    if (!(Reflect.has(event.directive, "endpoint") && Reflect.has(event.directive.endpoint, "endpointId"))) {
        switch (event.directive.header.namespace) {
            case "Alexa.Authorization":
                alexaAuthorization.handler(event, (error, response) => callback(error, response));
                break;
            case "Alexa.Discovery":
                alexaDiscovery.handler(event, (error, response) => callback(error, response));
                break;
            default:
                unknownDirectiveError(event, (error, response) => callback(error, response));
                break;
        }
    } else if (event.directive.endpoint.endpointId === "lg-webos-tv-gateway") {
        switch (event.directive.header.namespace) {
            case "Alexa":
                alexa.handler(event, (error, response) => {
                    if (error) {
                        errorToErrorResponse(error, event);
                    } else {
                        stateHandler(response, (err, res) => callback(err, res));
                    }
                });
                return;
            case "Alexa.EndpointHealth":
                alexaEndpointHealth.handler(event, (error, response) => {
                    if (error) {
                        errorToErrorResponse(error, event);
                    } else {
                        stateHandler(response, (err, res) => callback(err, res));
                    }
                });
                return;
            case "Alexa.PowerController":
                alexaPowerController.handler(event, (error, response) => {
                    if (error) {
                        errorToErrorResponse(error, event);
                    } else {
                        stateHandler(response, (err, res) => callback(err, res));
                    }
                });
                return;
            case "Alexa.RangeController":
                alexaRangeController.handler(event, (error, response) => {
                    if (error) {
                        errorToErrorResponse(error, event);
                    } else {
                        stateHandler(response, (err, res) => callback(err, res));
                    }
                });
                return;
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

function stateHandler(response, callback) {
    const alexaResponse = new AlexaResponse(response);
    const startTime = new Date();
    Promise.all([
        alexa.states(),
        alexaEndpointHealth.states(),
        alexaPowerController.states(),
        alexaRangeController.states()
    ]).then((values) => {
        const endTime = new Date();
        const timeOfSample = endTime.toISOString();
        const uncertaintyInMilliseconds = endTime.getTime() - startTime.getTime();
        const contextProperties = [];
        let index = 0;
        for (index = 0; index < values.length; index += 1) {
            if (values && values[index].length > 0) {
                contextProperties.push(...values[index]);
            }
        }
        if (contextProperties.length > 0) {
            for (index = 0; index < contextProperties.length; index += 1) {
                contextProperties[index].timeOfSample = timeOfSample;
                contextProperties[index].uncertaintyInMilliseconds = uncertaintyInMilliseconds;
                alexaResponse.addContextProperty(contextProperties[index]);
            }
        }
        callback(null, alexaResponse.get());
    }).
    // eslint-disable-next-line no-unused-vars
    catch((error) => {
        callback(null, alexaResponse.get());
    });
}

function errorToErrorResponse(error, event) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `${error.name}: ${error.message}.`
        }
    });
    return alexaResponse.get();
}

module.exports = {"handler": skillHandler};