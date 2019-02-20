const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return new Promise((resolve) => {
        resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.PlaybackController",
            "version": "3",
            "supportedOperations": [
                "Play",
                "Pause",
                "Stop",
                "Rewind",
                "FastForward"
            ]
        });
    });
}

// eslint-disable-next-line no-unused-vars
function states(lgtvControl, udn) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve) => {
        resolve([]);
    });
}

function handler(lgtvControl, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.PlaybackController") {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": "You were sent to Alexa Playback Controller processing in error."
                }
            });
            resolve(alexaResponse.get());
            return;
        }
        switch (event.directive.header.name) {
            case "Play":
                resolve(playHandler(lgtvControl, event));
                break;
            case "Pause":
                resolve(pauseHandler(lgtvControl, event));
                break;
            case "Stop":
                resolve(stopHandler(lgtvControl, event));
                break;
            case "Rewind":
                resolve(rewindHandler(lgtvControl, event));
                break;
            case "FastForward":
                resolve(fastForwardHandler(lgtvControl, event));
                break;
            default:
                resolve(unknownDirectiveError(lgtvControl, event));
                break;
        }
    });
}

function playHandler(lgtvControl, event) {
    return genericHandler(lgtvControl, event, "ssap://media.controls/play");
}

function pauseHandler(lgtvControl, event) {
    return genericHandler(lgtvControl, event, "ssap://media.controls/pause");
}

function stopHandler(lgtvControl, event) {
    return genericHandler(lgtvControl, event, "ssap://media.controls/stop");
}

function rewindHandler(lgtvControl, event) {
    return genericHandler(lgtvControl, event, "ssap://media.controls/rewind");
}

function fastForwardHandler(lgtvControl, event) {
    return genericHandler(lgtvControl, event, "ssap://media.controls/fastForward");
}

function genericHandler(lgtvControl, event, commandURI) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;
        const command = {
            "uri": commandURI
        };
        // eslint-disable-next-line no-unused-vars
        lgtvControl.lgtvCommand(endpointId, command, (error, _response) => {
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
                "message": `I do not know the Playback Controller directive ${event.directive.header.name}`
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