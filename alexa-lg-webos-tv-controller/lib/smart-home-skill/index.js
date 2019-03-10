const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const Gateway = require("../gateway-api");
const {errorToErrorResponse, directiveErrorResponse} = require("alexa-lg-webos-tv-common");
const alexaAuthorization = require("./authorization");
const alexaDiscovery = require("./discovery");
const alexa = require("./alexa");
const alexaEndpointHealth = require("./endpoint-health");
const alexaPowerController = require("./power-controller");
const alexaRangeController = require("./range-controller");

async function handlerWithLogging(event, context) {
    const response = await handler(event, context);

    const gateway = new Gateway("x");
    const logRequest = {
        "log": event
    };
    const logResponse = {
        "log": response
    };
    await gateway.sendSkillDirective(logRequest);
    await gateway.sendSkillDirective(logResponse);
    return response;
}

// eslint-disable-next-line no-unused-vars
function handler(event, _context) {
    try {
        if (!(Reflect.has(event.directive, "endpoint") && Reflect.has(event.directive.endpoint, "endpointId"))) {
            switch (event.directive.header.namespace) {
                case "Alexa.Authorization":
                    return alexaAuthorization.handler(event);
                case "Alexa.Discovery":
                    return alexaDiscovery.handler(event);
                default:
                    return directiveErrorResponse(event, event.directive.header.namespace);
            }
        } else if (event.directive.endpoint.endpointId === "lg-webos-tv-gateway") {
            switch (event.directive.header.namespace) {
                case "Alexa":
                    return stateHandler(alexa.handler(event));
                case "Alexa.EndpointHealth":
                    return stateHandler(alexaEndpointHealth.handler(event));
                case "Alexa.PowerController":
                    return stateHandler(alexaPowerController.handler(event));
                case "Alexa.RangeController":
                    return stateHandler(alexaRangeController.handler(event));
                default:
                    return directiveErrorResponse(event, event.directive.header.namespace);
            }
        } else {
            return remoteResponse(event);
        }
    } catch (error) {
        return errorToErrorResponse(error, event);
    }
}

async function remoteResponse(event) {
    const gateway = new Gateway("x");
    try {
        const response = await gateway.sendSkillDirective(event);
        return response;
    } catch (error) {
        return errorToErrorResponse(error, event);
    }
}

async function stateHandler(response) {
    const alexaResponse = new AlexaResponse(response);
    try {
        const startTime = new Date();
        const statesList = await Promise.all([
            Promise.resolve(alexa.states()),
            Promise.resolve(alexaEndpointHealth.states()),
            Promise.resolve(alexaPowerController.states()),
            Promise.resolve(alexaRangeController.states())
        ]);
        const endTime = new Date();
        const states = [].concat(...statesList);
        const timeOfSample = endTime.toISOString();
        const uncertaintyInMilliseconds = endTime.getTime() - startTime.getTime();
        states.forEach((contextProperty) => {
            contextProperty.timeOfSample = timeOfSample;
            contextProperty.uncertaintyInMilliseconds = uncertaintyInMilliseconds;
            alexaResponse.addContextProperty(contextProperty);
        });
        return alexaResponse.get();
    } catch (_error) {
        return alexaResponse.get();
    }
}

module.exports = {"handler": handlerWithLogging};