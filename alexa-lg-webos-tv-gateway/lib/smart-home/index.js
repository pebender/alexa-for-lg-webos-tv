const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const authorization = require("./authorization.js");
const discovery = require("./discovery.js");
const powerController = require("./power-controller.js");
const speaker = require("./speaker.js");
const channelController = require("./channel-controller.js");
const inputController = require("./input-controller.js");
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
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
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
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
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
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
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
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
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
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
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
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
        return;
    }
    switch (event.directive.header.namespace) {
        case "Alexa.Authorization":
            authorization.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa.Discovery":
            discovery.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa.PowerController":
            powerController.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa.Speaker":
            speaker.handler(lgtvControl, event, (error, response) => {
                if (error) {
                    callback(error, response);
                    return;
                }
                speaker.state(lgtvControl, response, (err, res) => {
                    if (err) {
                        callback(error, response);
                        return;
                    }
                    callback(error, response);
                });
            });
            return;
        case "Alexa.ChannelController":
            channelController.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa.InputController":
            inputController.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Alexa.PlaybackController":
            playbackController.handler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (error, response) => callback(error, response));
    }
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
    const alexaEvent = {"event": alexaResponse.get().event};
    callback(null, alexaEvent);
}

module.exports = {"handler": handler};