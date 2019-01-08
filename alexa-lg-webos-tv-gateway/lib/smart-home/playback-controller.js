const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return {
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
    };
}

function states(lgtvControl, udn, callback) {
    callback(null, null);
}

function handler(lgtvControl, event, callback) {
    if (event.directive.header.namespace !== "Alexa.PlaybackController") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Playback Controller processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    switch (event.directive.header.name) {
        case "Play":
            playHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Pause":
            pauseHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Stop":
            stopHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "Rewind":
            rewindHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "FastForward":
            fastForwardHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (error, response) => callback(error, response));
    }
}

function playHandler(lgtvControl, event, callback) {
    genericHandler(lgtvControl, event, "ssap://media.controls/play", callback);
}

function pauseHandler(lgtvControl, event, callback) {
    genericHandler(lgtvControl, event, "ssap://media.controls/pause", callback);
}

function stopHandler(lgtvControl, event, callback) {
    genericHandler(lgtvControl, event, "ssap://media.controls/stop", callback);
}

function rewindHandler(lgtvControl, event, callback) {
    genericHandler(lgtvControl, event, "ssap://media.controls/rewind", callback);
}

function fastForwardHandler(lgtvControl, event, callback) {
    genericHandler(lgtvControl, event, "ssap://media.controls/fastForward", callback);
}

function genericHandler(lgtvControl, event, commandURI, callback) {
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
            callback(null, alexaResponse.get());
            return;
        }
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
            "message": `I do not know the Playback Controller directive ${event.directive.header.name}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};