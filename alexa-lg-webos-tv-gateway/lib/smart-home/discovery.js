const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const alexa = require("./alexa.js");
const alexaPowerController = require("./power-controller.js");
const alexaSpeaker = require("./speaker.js");
const alexaChannelController = require("./channel-controller.js");
const alexaInputController = require("./input-controller.js");
const alexaLauncher = require("./launcher.js");
const alexaPlaybackController = require("./playback-controller.js");

function handler(lgtvControl, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.Discovery") {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": `You were sent to Discovery processing in error ${event.directive.header.namespace}.`
                }
            });
            resolve(alexaResponse.get());
            return;
        }

        lgtvControl.getDb().find(
            {},
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
                    resolve(alexaResponse.get());
                    return;
                }

                resolve(Promise.all(docs.map(buildEndpoint)).
                    then(buildResponse));
            }
        );
    });
    function buildEndpoint(doc) {
        return new Promise((resolve) => {
            const [udn] = doc.udn;
            resolve(Promise.all([
                    alexa.capabilities(lgtvControl, event, doc.udn),
                    alexaPowerController.capabilities(lgtvControl, event, udn),
                    alexaSpeaker.capabilities(lgtvControl, event, udn),
                    alexaChannelController.capabilities(lgtvControl, event, udn),
                    alexaInputController.capabilities(lgtvControl, event, udn),
                    alexaLauncher.capabilities(lgtvControl, event, udn),
                    alexaPlaybackController.capabilities(lgtvControl, event, udn)
                ]).
                then(buildEndpointHandler).
                catch(buildEndpointErrorHandler));
        });

        function buildEndpointHandler(capabilitiesList) {
            return new Promise((resolve) => {
                const endpoint = {
                    "endpointId": doc.udn,
                    "friendlyName": doc.name,
                    "description": "LG webOS TV",
                    "manufacturerName": "LG Electronics",
                    "displayCategories": ["TV"],
                    "capabilities": capabilitiesList
                };
                resolve(endpoint);
            });
        }

        // eslint-disable-next-line no-unused-vars
        function buildEndpointErrorHandler(_error) {
            return new Promise((resolve) => {
                const endpoint = null;
                resolve(endpoint);
            });
        }
    }

    function buildResponse(endpoints) {
        return new Promise((resolve) => {
            const alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response",
                "token": event.directive.payload.scope.token
            });
            endpoints.forEach((endpoint) => {
                if (endpoint !== null) {
                    alexaResponse.addPayloadEndpoint(endpoint);
                }
            });
            resolve(alexaResponse.get());
        });
    }
}

module.exports = {
    "handler": handler
};