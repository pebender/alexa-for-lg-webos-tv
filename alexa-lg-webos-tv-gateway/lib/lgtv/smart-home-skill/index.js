const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const alexaAuthorization = require("./authorization");
const alexaDiscovery = require("./discovery");
const alexa = require("./alexa");
const alexaPowerController = require("./power-controller");
const alexaSpeaker = require("./speaker");
const alexaChannelController = require("./channel-controller");
const alexaInputController = require("./input-controller");
const alexaLauncher = require("./launcher");
const alexaPlaybackController = require("./playback-controller");
const {errorResponse} = require("../../common");

function handler(lgtvController, event) {
    return new Promise((resolve) => {
        if (!Reflect.has(event, "directive")) {
            resolve(missingKeyError(event, "directive"));
            return;
        }
        if (!Reflect.has(event.directive, "header")) {
            resolve(missingKeyError(event, "directive.header"));
            return;
        }
        if (!Reflect.has(event.directive.header, "payloadVersion")) {
            resolve(missingKeyError(event, "directive.header.payloadVersion"));
            return;
        }
        if (!(event.directive.header.payloadVersion === "3")) {
            resolve(errorResponse(
                event,
                "INTERNAL_ERROR",
                "This skill only supports Smart Home API version three."
            ));
            return;
        }
        if (!Reflect.has(event.directive.header, "namespace")) {
            resolve(missingKeyError(event, "directive.header.namespace"));
            return;
        }
        if (!Reflect.has(event.directive.header, "name")) {
            resolve(missingKeyError(event, "directive.header.name"));
            return;
        }

        const namespaces = {
            "Alexa.Authorization": alexaAuthorization.handler,
            "Alexa.Discovery": alexaDiscovery.handler,
            "Alexa": alexa.handler,
            "Alexa.PowerController": alexaPowerController.handler,
            "Alexa.Speaker": alexaSpeaker.handler,
            "Alexa.ChannelController": alexaChannelController.handler,
            "Alexa.InputController": alexaInputController.handler,
            "Alexa.Launcher": alexaLauncher.handler,
            "Alexa.PlaybackController": alexaPlaybackController.handler
        };
        const {namespace} = event.directive.header;
        if (Reflect.has(namespaces, namespace)) {
            const fn = namespaces[namespace];
            if (Reflect.has(event.directive, "endpoint") &&
                Reflect.has(event.directive.endpoint, "endpointId")) {
                const {endpointId} = event.directive.endpoint;
                resolve(fn(lgtvController, event).
                    then((response) => stateHandler(lgtvController, endpointId, response)));
            } else {
                resolve(fn(lgtvController, event));
            }
        } else {
            resolve(unknownNamespaceError(lgtvController, event));
        }
    });
}

function stateHandler(lgtvController, udn, response) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse(response);
        const startTime = new Date();
        resolve(Promise.all([
                alexa.states(lgtvController, udn),
                alexaPowerController.states(lgtvController, udn),
                alexaSpeaker.states(lgtvController, udn),
                alexaChannelController.states(lgtvController, udn),
                alexaInputController.states(lgtvController, udn),
                alexaLauncher.states(lgtvController, udn),
                alexaPlaybackController.states(lgtvController, udn)
            ]).
            then((values) => {
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
                return alexaResponse.get();
            }).
            catch(() => alexaResponse.get()));
    });
}

function unknownNamespaceError(lgtvController, event) {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `Unknown namespace ${event.directive.header.namespace}`
    );
}

function missingKeyError(event, key) {
    return errorResponse(
        event,
        "INVALID_DIRECTIVE",
        `Missing key: ${key}.`
    );
}

module.exports = {"handler": handler};