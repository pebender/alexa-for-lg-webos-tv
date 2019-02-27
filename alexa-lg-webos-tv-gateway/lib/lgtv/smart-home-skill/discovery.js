const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {namespaceErrorResponse} = require("../../common");
const alexa = require("./alexa.js");
const alexaPowerController = require("./power-controller.js");
const alexaSpeaker = require("./speaker.js");
const alexaChannelController = require("./channel-controller.js");
const alexaInputController = require("./input-controller.js");
const alexaLauncher = require("./launcher.js");
const alexaPlaybackController = require("./playback-controller.js");

function handler(lgtv, event) {
    return new Promise((resolve, reject) => {
        if (event.directive.header.namespace !== "Alexa.Discovery") {
            namespaceErrorResponse(event, "Alexa.Discovery");
            return;
        }

        lgtv.getUDNList().
        then((udnList) => {
            resolve(Promise.all(udnList.map(buildEndpoint)).
            then(buildResponse));
            // eslint-disable-next-line no-useless-return
            return;
        }).
        catch((error) => {
            reject(error);
            // eslint-disable-next-line no-useless-return
            return;
        });
    });

    function buildEndpoint(udn) {
        return new Promise((resolve) => {
            resolve(Promise.all([
                    alexa.capabilities(lgtv, event, udn),
                    alexaPowerController.capabilities(lgtv, event, udn),
                    alexaSpeaker.capabilities(lgtv, event, udn),
                    alexaChannelController.capabilities(lgtv, event, udn),
                    alexaInputController.capabilities(lgtv, event, udn),
                    alexaLauncher.capabilities(lgtv, event, udn),
                    alexaPlaybackController.capabilities(lgtv, event, udn)
                ]).
                then(buildEndpointHandler).
                catch(buildEndpointErrorHandler));
        });

        function buildEndpointHandler(capabilitiesList) {
            return new Promise((resolve) => {
                const {name} = lgtv.tv(udn);
                const endpoint = {
                    "endpointId": udn,
                    "friendlyName": name,
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