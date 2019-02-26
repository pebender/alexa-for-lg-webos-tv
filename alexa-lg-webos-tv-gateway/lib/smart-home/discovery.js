const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {namespaceErrorResponse} = require("../common");
const alexa = require("./alexa.js");
const alexaPowerController = require("./power-controller.js");
const alexaSpeaker = require("./speaker.js");
const alexaChannelController = require("./channel-controller.js");
const alexaInputController = require("./input-controller.js");
const alexaLauncher = require("./launcher.js");
const alexaPlaybackController = require("./playback-controller.js");

function handler(lgtvController, event) {
    return new Promise((resolve, reject) => {
        if (event.directive.header.namespace !== "Alexa.Discovery") {
            namespaceErrorResponse(event, "Alexa.Discovery");
            return;
        }

        lgtvController.db.find(
            {},
            (err, docs) => {
                if (err) {
                    reject(err);
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
                    alexa.capabilities(lgtvController, event, doc.udn),
                    alexaPowerController.capabilities(lgtvController, event, udn),
                    alexaSpeaker.capabilities(lgtvController, event, udn),
                    alexaChannelController.capabilities(lgtvController, event, udn),
                    alexaInputController.capabilities(lgtvController, event, udn),
                    alexaLauncher.capabilities(lgtvController, event, udn),
                    alexaPlaybackController.capabilities(lgtvController, event, udn)
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