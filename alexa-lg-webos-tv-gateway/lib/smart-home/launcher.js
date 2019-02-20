const {AlexaResponse} = require("alexa-lg-webos-tv-common");

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
function capabilities(_lgtvControl, _event, _udn) {
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

function states(lgtvControl, udn) {
    return new Promise((resolve) => {
        if (lgtvControl.getPowerState(udn) === "OFF") {
            resolve([]);
        }

        const command = {
            "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
        };
        lgtvControl.lgtvCommand(udn, command, (error, response) => {
            if (error) {
                resolve([]);
            }
            if (Reflect.has(lgtvToAlexa, response.appId)) {
                const target = lgtvToAlexa[response.appId];
                const targetState = AlexaResponse.createContextProperty({
                    "namespace": "Alexa.Launcher",
                    "name": "target",
                    "value": target
                });
                resolve([targetState]);
            }
            resolve([]);
        });
    });
}

function handler(lgtvControl, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.Launcher") {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": "You were sent to Launcher processing in error."
                }
            });
            resolve(alexaResponse.get());
            return;
        }
        switch (event.directive.header.name) {
            case "LaunchTarget":
                resolve(launchTargetHandler(lgtvControl, event));
                break;
            default:
                resolve(unknownDirectiveError(lgtvControl, event));
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
function launchTargetHandler(lgtvControl, event) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;

        const command = {
            "uri": "ssap://system.launcher/launch"
        };
        if (Reflect.has(alexaToLGTV, event.directive.payload.identifier)) {
            command.payload = alexaToLGTV[event.directive.payload.identifier];
        } else {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": `I do not know the Launcher target ${event.directive.payload.identifier}`
                }
            });
            resolve(alexaResponse.get());
            return;
        }
        // eslint-disable-next-line no-unused-vars
        lgtvControl.lgtvCommand(endpointId, command, (error, response) => {
            if (error) {
                const alexaResponse = new AlexaResponse({
                    "request": event,
                    "name": "ErrorResponse",
                    "payload": {
                        "type": "INTERNAL_ERROR",
                        "message": `${error.name}: ${error.message}.`
                    }
                });
                resolve(alexaResponse.get());
                return;
            }
            const alexaResponse = new AlexaResponse({
                "request": event
            });
            resolve(alexaResponse.get());
        });
    });
}

function unknownDirectiveError(lgtvControl, event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": `I do not know the Alexa Launcher directive ${event.directive.header.name}`
            }
        });
        resolve(alexaResponse.get());
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};