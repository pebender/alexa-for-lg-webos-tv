const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const authorization = require("./authorization.js");
const discovery = require("./discovery.js");
const powerController = require("./power-controller.js");
const speaker = require("./speaker.js");
const channelController = require("./channel-controller.js");
const inputController = require("./input-controller.js");
const launcher = require("./launcher.js");
const playbackController = require("./playback-controller.js");

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
            authorization.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa.Discovery":
            discovery.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa.PowerController":
            powerController.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.Speaker":
            speaker.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.ChannelController":
            channelController.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
        return;
        case "Alexa.InputController":
            inputController.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.Launcher":
            launcher.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    errorToErrorResponse(error, event);
                } else {
                    stateHandler(lgtvControl, udn, response, (err, res) => callback(err, res));
                }
            });
            return;
        case "Alexa.PlaybackController":
            playbackController.handler(lgtvControl, event, (error, response) => {
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
    let index = 0;
    powerController.states(lgtvControl, udn, (powerControllerError, powerControllerResponses) => {
        if (!powerControllerError && powerControllerResponses && powerControllerResponses.length > 0) {
            for (index = 0; index < powerControllerResponses.length; index += 1) {
                alexaResponse.addContextProperty(powerControllerResponses[index]);
            }
        }
        speaker.states(lgtvControl, udn, (speakerError, speakerResponses) => {
            if (!speakerError && speakerResponses && speakerResponses.length > 0) {
                for (index = 0; index < speakerResponses.length; index += 1) {
                    alexaResponse.addContextProperty(speakerResponses[index]);
                }
            }
            channelController.states(lgtvControl, udn, (channelControllerError, channelControllerResponses) => {
                if (!channelControllerError && channelControllerResponses && channelControllerResponses.length > 0) {
                    for (index = 0; index < channelControllerResponses.length; index += 1) {
                        alexaResponse.addContextProperty(channelControllerResponses[index]);
                    }
                }
                inputController.states(lgtvControl, udn, (inputControllerError, inputControllerResponses) => {
                    if (!inputControllerError && inputControllerResponses && inputControllerResponses.length > 0) {
                        for (index = 0; index < inputControllerResponses.length; index += 1) {
                            alexaResponse.addContextProperty(inputControllerResponses[index]);
                        }
                    }
                    launcher.states(lgtvControl, udn, (launcherError, launcherResponses) => {
                        if (!launcherError && launcherResponses && launcherResponses.length > 0) {
                            for (index = 0; index < launcherResponses.length; index += 1) {
                                alexaResponse.addContextProperty(launcherResponses[index]);
                            }
                        }
                        playbackController.states(lgtvControl, udn, (playbackControllerError, playbackControllerResponses) => {
                            if (!playbackControllerError && playbackControllerResponses && playbackControllerResponses.length > 0) {
                                for (index = 0; index < playbackControllerResponses.length; index += 1) {
                                    alexaResponse.addContextProperty(playbackControllerResponses[index]);
                                }
                            }
                            callback(null, alexaResponse.get());
                        });
                    });
                });
            });
        });
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