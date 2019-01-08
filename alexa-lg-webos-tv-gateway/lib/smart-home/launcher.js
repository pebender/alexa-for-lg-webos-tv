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
    return {
        "type": "AlexaInterface",
        "interface": "Alexa.Launcher",
        "version": "3"
    };
}

function states(lgtvControl, udn, callback) {
    if (lgtvControl.getPowerState(udn) === "OFF") {
        callback(null, []);
        return;
    }

    const command = {
        "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
    };
    lgtvControl.lgtvCommand(udn, command, (error, response) => {
        if (error) {
            callback(error, null);
            return;
        }
        if (Reflect.has(lgtvToAlexa, response.appId)) {
            const target = lgtvToAlexa[response.appId];
            const targetState = AlexaResponse.createContextProperty({
                "namespace": "Alexa.Launcher",
                "name": "target",
                "value": target
            });
            callback(null, [targetState]);
            return;
        }
        callback(null, []);
    });
}

function handler(lgtvControl, event, callback) {
    if (event.directive.header.namespace !== "Alexa.Launcher") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Launcher processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    switch (event.directive.header.name) {
        case "LaunchTarget":
            launchTargetHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (error, response) => callback(error, response));
    }
}

/*
 * A list of Alexa target identifiers can be found at
 * <https://developer.amazon.com/docs/video/launch-target-reference.html>.
 * A list of LG webOS TV target ids can be found bet issuing the command
 * "ssap://com.webos.applicationManager/listLaunchPoints".
 */
function launchTargetHandler(lgtvControl, event, callback) {
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
        callback(null, alexaResponse.get());
        return;
    }
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
            callback(null, alexaResponse.get());
            return;
        }
console.log(JSON.stringify(response, null, 2));
        const alexaResponse = new AlexaResponse({
            "request": event
        });
        callback(null, alexaResponse.get());
    });
}

function unknownDirectiveError(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Launcher directive ${event.directive.header.name}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};