const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("../../common");

const alexaToLGTV = {
    // Amazon Video
    "amzn1.alexa-ask-target.app.72095": {
        "id": "amazon"
    },
    // Hulu
    "amzn1.alexa-ask-target.app.77683": {
        "id": "hulu"
    },
    // Netflix
    "amzn1.alexa-ask-target.app.36377": {
        "id": "netflix"
    },
    // Plex
    "amzn1.alexa-ask-target.app.78079": {
        "id": "cdp-30"
    },
    // Vudu
    "amzn1.alexa-ask-target.app.64811": {
        "id": "vudu"
    },
    // YouTube
    "amzn1.alexa-ask-target.app.70045": {
        "id": "youtube.leanback.v4"
    }
};

const lgtvToAlexa = {
    "amazon": {
        "identifier": "amzn1.alexa-ask-target.app.72095",
        "name": "Amazon Video"
    },
    "hulu": {
        "identifier": "amzn1.alexa-ask-target.app.77683",
        "name": "Hulu"
    },
    "netflix": {
        "identifier": "amzn1.alexa-ask-target.app.36377",
        "name": "Netflix"
    },
    "cdp-30": {
        "identifier": "amzn1.alexa-ask-target.app.78079",
        "name": "Plex"
    },
    "vudu": {
        "identifier": "amzn1.alexa-ask-target.app.64811",
        "name": "Vudu"
    },
    "youtube.leanback.v4": {
        "identifier": "amzn1.alexa-ask-target.app.70045",
        "name": "YouTube"
    }
};

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv, _event, _udn) {
    return new Promise((resolve) => {
        resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.Launcher",
            "version": "3",
            "properties": {
                "supported": [
                    {
                        "name": "identifier"
                    },
                    {
                        "name": "name"
                    }
                ],
                "proactivelyReported": false,
                "retrievable": true
            }
        });
    });
}

function states(lgtv, udn) {
    return getInput().
        then(mapInput).
        then(buildStates);

    function getInput() {
        return new Promise((resolve) => {
            if (lgtv.getPowerState(udn) === "OFF") {
                resolve(null);
                return;
            }

            const command = {
                "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
            };
            resolve(lgtv.lgtvCommand(udn, command));
        });
    }

    function mapInput(response) {
        return new Promise((resolve) => {
            if (Reflect.has(lgtvToAlexa, response.appId)) {
                resolve(lgtvToAlexa[response.appId]);
                return;
            }
            resolve(null);
        });
    }

    function buildStates(target) {
        return new Promise((resolve) => {
            if (target === null) {
                resolve([]);
                return;
            }
            const targetState = AlexaResponse.createContextProperty({
                "namespace": "Alexa.Launcher",
                "name": "target",
                "value": target
            });
            resolve([targetState]);
        });
    }
}

function handler(lgtv, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.Launcher") {
            resolve(namespaceErrorResponse(event, "Alexa.Launcher"));
            return;
        }
        switch (event.directive.header.name) {
            case "LaunchTarget":
                resolve(launchTargetHandler(lgtv, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtv, event));
                break;
        }
    });
}

/*
 * A list of Alexa target identifiers can be found at
 * <https://developer.amazon.com/docs/video/launch-target-reference.html>.
 * A list of LG webOS TV target ids can be found bet issuing the command
 * "ssap://com.webos.applicationManager/listLaunchPoints".
 */
function launchTargetHandler(lgtv, event) {
    return new Promise((resolve) => {
        if (Reflect.has(alexaToLGTV, event.directive.payload.identifier)) {
            resolve(errorResponse(
                event,
                "INTERNAL_ERROR",
                `I do not know the Launcher target ${event.directive.payload.identifier}`
            ));
            return;
        }
        const {endpointId} = event.directive.endpoint;
        const command = {
            "uri": "ssap://system.launcher/launch",
            "payload": alexaToLGTV[event.directive.payload.identifier]
        };
        // eslint-disable-next-line no-unused-vars
        resolve(lgtv.lgtvCommand(endpointId, command).
            then(() => {
                const alexaResponse = new AlexaResponse({
                    "request": event
                });
                return alexaResponse.get();
            }));
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};