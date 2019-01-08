const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const alexaAuthorization = require("./authorization.js");
const alexaDiscovery = require("./discovery.js");
const alexa = require("./alexa.js");
const alexaPowerController = require("./power-controller.js");
const alexaSpeaker = require("./speaker.js");
const alexaChannelController = require("./channel-controller.js");
const alexaInputController = require("./input-controller.js");
const alexaLauncher = require("./launcher.js");
const alexaPlaybackController = require("./playback-controller.js");

function handler(lgtvControl, event, callback) {
    if (!Reflect.has(event, "directive")) {
        const alexaResponse = new AlexaResponse({
            "name": "ErrorResponse",
            "payload": {
                "type": "INVALID_DIRECTIVE",
                "message": "Missing key: directive."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    if (!Reflect.has(event.directive, "header")) {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INVALID_DIRECTIVE",
                "message": "Missing key: directive.header."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    if (!Reflect.has(event.directive.header, "payloadVersion")) {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INVALID_DIRECTIVE",
                "message": "Missing key: directive.header.payloadVersion."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    if (event.directive.header.payloadVersion !== "3") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "This skill only supports Smart Home API version three."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    if (!Reflect.has(event.directive.header, "namespace")) {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INVALID_DIRECTIVE",
                "message": "Missing key: directive.header.namespace."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    if (!Reflect.has(event.directive.header, "name")) {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INVALID_DIRECTIVE",
                "message": "Missing key: directive.header.name."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    const udn = event.directive.endpoint.endpointId;
    switch (event.directive.header.namespace) {
        case "Alexa.Authorization":
            alexaAuthorization.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa.Discovery":
            alexaDiscovery.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa":
            alexa.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.PowerController":
            alexaPowerController.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.Speaker":
            alexaSpeaker.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.ChannelController":
            alexaChannelController.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
        return;
        case "Alexa.InputController":
            alexaInputController.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.Launcher":
            alexaLauncher.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.PlaybackController":
            alexaPlaybackController.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (err, res) => callback(err, res));
    }
}

function stateHandler(lgtvControl, udn, response, callback) {
    const alexaResponse = new AlexaResponse(response);
    const startTime = new Date();
    Promise.all([
        alexa.states(lgtvControl, udn),
        alexaPowerController.states(lgtvControl, udn),
        alexaSpeaker.states(lgtvControl, udn),
        alexaChannelController.states(lgtvControl, udn),
        alexaInputController.states(lgtvControl, udn),
        alexaLauncher.states(lgtvControl, udn),
        alexaPlaybackController.states(lgtvControl, udn)
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

function unknownDirectiveError(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Directive ${event.directive.header.namespace}`
        }
    });
    callback(null, alexaResponse.get());
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

module.exports = {"handler": handler};