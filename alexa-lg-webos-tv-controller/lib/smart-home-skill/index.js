const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const Gateway = require("../gateway-api");
const {unknownDirectiveError} = require("./common");
const alexaAuthorization = require("./authorization");
const alexaDiscovery = require("./discovery");
const alexa = require("./alexa");
const alexaEndpointHealth = require("./endpoint-health");
const alexaPowerController = require("./power-controller");
const alexaRangeController = require("./range-controller");

function logSkillHandler(event, context, callback) {
    skillHandler(event, context, (error, response) => {
        if (error) {
            callback(error, response);
            return;
        }
        const gateway = new Gateway("x");
        const logRequest = {
            "log": event
        };
        const logResponse = {
            "log": response
        };
        gateway.sendSkillDirective(logRequest).
            then(() => gateway.sendSkillDirective(logResponse)).
            then(() => callback(error, response)).
            catch((err) => callback(err, response));
    });
}

function skillHandler(event, _context, callback) {
    skillHandlerWithPromise(event, _context).
    then((response) => callback(null, response)).
    catch((error) => callback(error, null));
}

// eslint-disable-next-line no-unused-vars
function skillHandlerWithPromise(event, _context) {
    return new Promise((resolve) => {
        if (!(Reflect.has(event.directive, "endpoint") && Reflect.has(event.directive.endpoint, "endpointId"))) {
            switch (event.directive.header.namespace) {
                case "Alexa.Authorization":
                    resolve(alexaAuthorization.handler(event));
                    return;
                case "Alexa.Discovery":
                    resolve(alexaDiscovery.handler(event));
                    return;
                default:
                    resolve(unknownDirectiveError(event));
            }
        } else if (event.directive.endpoint.endpointId === "lg-webos-tv-gateway") {
            switch (event.directive.header.namespace) {
                case "Alexa":
                    alexa.handler(event).
                        then((response) => resolve(stateHandler(response))).
                        catch((error) => resolve(errorToErrorResponse(error, event)));
                    return;
                case "Alexa.EndpointHealth":
                    alexaEndpointHealth.handler(event).
                        then((response) => resolve(stateHandler(response))).
                        catch((error) => resolve(errorToErrorResponse(error, event)));
                    return;
                case "Alexa.PowerController":
                    alexaPowerController.handler(event).
                        then((response) => resolve(stateHandler(response))).
                        catch((error) => resolve(errorToErrorResponse(error, event)));
                    return;
                case "Alexa.RangeController":
                    alexaRangeController.handler(event).
                        then((response) => resolve(stateHandler(response))).
                        catch((error) => resolve(errorToErrorResponse(error, event)));
                    return;
                default:
                    resolve(unknownDirectiveError(event));
                    break;
            }
        } else {
            resolve(remoteResponse(event));
        }
    });
}

function remoteResponse(event) {
    return new Promise((resolve) => {
        const gateway = new Gateway("x");
        gateway.sendSkillDirective(event).
            then((response) => resolve(response)).
            catch((error) => resolve(errorToErrorResponse(error, event)));
    });
}

function stateHandler(response) {
    return new Promise((resolve) => {
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
            values.forEach((value) => {
                if (value.length > 0) {
                    contextProperties.push(...value);
                }
            });
            contextProperties.forEach((contextProperty) => {
                contextProperty.timeOfSample = timeOfSample;
                contextProperty.uncertaintyInMilliseconds = uncertaintyInMilliseconds;
                alexaResponse.addContextProperty(contextProperty);
            });
            resolve(alexaResponse.get());
        }).
        // eslint-disable-next-line no-unused-vars
        catch((error) => {
            resolve(alexaResponse.get());
        });
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

module.exports = {"handler": logSkillHandler};