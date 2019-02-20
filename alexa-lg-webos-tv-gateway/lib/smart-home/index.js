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
const {errorResponse} = require("../common");

function handler(lgtvControl, event) {
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
                resolve(fn(lgtvControl, event).
                    then((response) => stateHandler(lgtvControl, endpointId, response)));
            } else {
                resolve(fn(lgtvControl, event));
                }
        } else {
            resolve(unknownNamespaceError(lgtvControl, event));
        }
    });
}

function stateHandler(lgtvControl, udn, response) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse(response);
        const startTime = new Date();
        resolve(Promise.all([
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
            return alexaResponse.get();
        }).
        // eslint-disable-next-line no-unused-vars
        catch((error) => alexaResponse.get()));
    });
}
function unknownNamespaceError(lgtvControl, event) {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `Unknown namespace ${event.directive.header.namespace}`
    );
}

function missingKeyError(event, key, cb) {
    return errorResponse(
        event,
        "INVALID_DIRECTIVE",
        `Missing key: ${key}.`, cb
    );
}

module.exports = {"handler": handler};