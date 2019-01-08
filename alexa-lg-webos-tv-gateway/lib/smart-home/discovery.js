const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const alexa = require("./alexa.js");
const alexaPowerController = require("./power-controller.js");
const alexaSpeaker = require("./speaker.js");
const alexaChannelController = require("./channel-controller.js");
const alexaInputController = require("./input-controller.js");
const alexaLauncher = require("./launcher.js");
const alexaPlaybackController = require("./playback-controller.js");

function handler(lgtvControl, event, callback) {
    if (event.directive.header.namespace !== "Alexa.Discovery") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": `You were sent to Discovery processing in error ${event.directive.header.namespace}.`
            }
        });
        callback(null, alexaResponse.get());
        return;
    }

    lgtvControl.getDb().find(
        {},
        {
            "udn": 1,
            "name": 1
        },
        (err, docs) => {
            if (err) {
                const alexaResponse = new AlexaResponse({
                    "request": event,
                    "name": "ErrorResponse",
                    "payload": {
                        "type": "INTERNAL_ERROR",
                        "message": `${err.name}: ${err.message}`
                    }
                });
                callback(null, alexaResponse.get());
                return;
            }

            const alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response",
                "token": event.directive.payload.scope.token
            });
            let index = 0;
            for (index = 0; index < docs.length; index += 1) {
                const [udn] = docs[index].udn;
                const [name] = docs[index].name;
                const capabilityAlexa = alexa.capabilities(lgtvControl, event, udn);
                const capabilityAlexaPowerController = alexaPowerController.capabilities(lgtvControl, event, udn);
                const capabilityAlexaSpeaker = alexaSpeaker.capabilities(lgtvControl, event, udn);
                const capabilityAlexaChannelController = alexaChannelController.capabilities(lgtvControl, event, udn);
                const capabilityAlexaInputController = alexaInputController.capabilities(lgtvControl, event, udn);
                const capabilityAlexaLauncher = alexaLauncher.capabilities(lgtvControl, event, udn);
                const capabilityAlexaPlaybackController = alexaPlaybackController.capabilities(lgtvControl, event, udn);
                alexaResponse.addPayloadEndpoint({
                    "endpointId": udn,
                    "friendlyName": name,
                    "description": "LG webOS TV",
                    "manufacturerName": "LG Electronics",
                    "displayCategories": ["TV"],
                    "capabilities": [
                        capabilityAlexa,
                        capabilityAlexaPowerController,
                        capabilityAlexaSpeaker,
                        capabilityAlexaChannelController,
                        capabilityAlexaInputController,
                        capabilityAlexaLauncher,
                        capabilityAlexaPlaybackController
                    ]
                });
            }
            callback(null, alexaResponse.get());
        }
    );
}

module.exports = {
    "handler": handler
};