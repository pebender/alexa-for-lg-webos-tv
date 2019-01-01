const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return {
        "type": "AlexaInterface",
        "interface": "Alexa.Speaker",
        "version": "3"
    };
}

function state(lgtvControl, event, callback) {
    const {endpointId} = event.directive.endpoint;
    const command = {
        "uri": "ssap://audio/getVolume"
    };
    // eslint-disable-next-line no-unused-vars
    lgtvControl.lgtvCommand(endpointId, command, (error, response) => {
        if (error) {
            callback(error, null);
            return;
        }
        const volumeState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "volume",
            "value": response.volume
        });
        const mutedState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "muted",
            "value": response.muted
        });
        callback(null, [
            volumeState,
            mutedState
        ]);
    });
}

function handler(lgtvControl, event, callback) {
    if (event.directive.header.namespace !== "Alexa.Speaker") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Speaker processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    switch (event.directive.header.name) {
        case "SetVolume":
            setVolumeHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "AdjustVolume":
            adjustVolumeHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "SetMute":
            setMuteHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (error, response) => callback(error, response));
    }
}

function setVolumeHandler(lgtvControl, event, callback) {
    const {endpointId} = event.directive.endpoint;

    const {volume} = event.directive.payload;
    if ((volume < 0) || (volume > 100)) {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "VALUE_OUT_OF_RANGE",
                "message": "volume must be between 0 and 100 inclusive."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    const command = {
        "uri": "ssap://audio/setVolume",
        "payload": {"volume": volume}
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

function adjustVolumeHandler(lgtvControl, event, callback) {
    const {endpointId} = event.directive.endpoint;

    const getVolume = {
        "uri": "ssap://audio/getVolume"
    };
    lgtvControl.lgtvCommand(endpointId, getVolume, (error, response) => {
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
        if (!Reflect.has(response, "volume")) {
            const alexaResponse = new AlexaResponse({
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": "The T.V. did not return it's volume."
                }
            });
            callback(null, alexaResponse.get());
            return;
        }
        let {volume} = response;
        volume += event.directive.payload.volumeDefault
            ? 1
            : event.directive.payload.volume;
        volume = volume < 0
            ? 0
            : volume;
        volume = volume > 100
            ? 100
            : volume;
        const setVolume = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        // eslint-disable-next-line no-unused-vars
        lgtvControl.lgtvCommand(endpointId, setVolume, (err, _res) => {
            if (err) {
                const alexaResponse = new AlexaResponse({
                    "request": event,
                    "name": "ErrorResponse",
                    "payload": {
                        "type": "INTERNAL_ERROR",
                        "message": `${err.name}: ${err.message}.`
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
    });
}

function setMuteHandler(lgtvControl, event, callback) {
    const {endpointId} = event.directive.endpoint;

    const command = {
        "uri": "ssap://audio/setMute",
        "payload": {"mute": event.directive.payload.mute}
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
            "message": `I do not know the Speaker directive ${event.directive.header.name}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "state": state,
    "capabilities": capabilities,
    "handler": handler
};