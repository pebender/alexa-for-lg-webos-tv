const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {errorToErrorResponse, errorResponse} = require("alexa-lg-webos-tv-common");
const alexaAuthorization = require("./authorization");
const alexaDiscovery = require("./discovery");
const alexa = require("./alexa");
const alexaPowerController = require("./power-controller");
const alexaSpeaker = require("./speaker");
const alexaChannelController = require("./channel-controller");
const alexaInputController = require("./input-controller");
const alexaLauncher = require("./launcher");
const alexaPlaybackController = require("./playback-controller");

async function handler(lgtv, event) {
    if (!Reflect.has(event, "directive")) {
        return missingKeyError(event, "directive");
    }
    if (!Reflect.has(event.directive, "header")) {
        return missingKeyError(event, "directive.header");
    }
    if (!Reflect.has(event.directive.header, "payloadVersion")) {
        return missingKeyError(event, "directive.header.payloadVersion");
    }
    if (!(event.directive.header.payloadVersion === "3")) {
        return errorResponse(
            event,
            "INTERNAL_ERROR",
            "This skill only supports Smart Home API version three."
        );
    }
    if (!Reflect.has(event.directive.header, "namespace")) {
        return missingKeyError(event, "directive.header.namespace");
    }
    if (!Reflect.has(event.directive.header, "name")) {
        return missingKeyError(event, "directive.header.name");
    }

    try {
        switch (event.directive.header.namespace) {
            case "Alexa.Authorization":
                return alexaAuthorization.handler(lgtv, event);
            case "Alexa.Discovery":
                return alexaDiscovery.handler(lgtv, event);
            case "Alexa":
                return stateHandler(alexa.handler(lgtv, event));
            case "Alexa.PowerController":
                return stateHandler(alexaPowerController.handler(lgtv, event));
            case "Alexa.Speaker":
                return stateHandler(await alexaSpeaker.handler(lgtv, event));
            case "Alexa.ChannelController":
                return stateHandler(alexaChannelController.handler(lgtv, event));
            case "Alexa.InputController":
                return stateHandler(alexaInputController.handler(lgtv, event));
            case "Alexa.Launcher":
                return stateHandler(alexaLauncher.handler(lgtv, event));
            case "Alexa.PlaybackController":
                return stateHandler(alexaPlaybackController.handler(lgtv, event));
            default:
                return unknownNamespaceError();
        }
    } catch (error) {
        return errorToErrorResponse(event, error);
    }

    async function stateHandler(response) {
        const alexaResponse = new AlexaResponse(response);
        try {
            const udn = event.directive.endpoint.endpointId;
            const startTime = new Date();
            const statesList = await Promise.all([
                alexa.states(lgtv, udn),
                alexaPowerController.states(lgtv, udn),
                alexaSpeaker.states(lgtv, udn),
                alexaChannelController.states(lgtv, udn),
                alexaInputController.states(lgtv, udn),
                alexaLauncher.states(lgtv, udn),
                alexaPlaybackController.states(lgtv, udn)
            ].map((value) => Promise.resolve(value)));
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
        } catch (error) {
            return alexaResponse.get();
        }
    }

    function unknownNamespaceError() {
        return errorResponse(
            event,
            "INTERNAL_ERROR",
            `Unknown namespace ${event.directive.header.namespace}`
        );
    }

    function missingKeyError(key) {
        return errorResponse(
            event,
            "INVALID_DIRECTIVE",
            `Missing key: ${key}.`
        );
    }
}

module.exports = {"handler": handler};