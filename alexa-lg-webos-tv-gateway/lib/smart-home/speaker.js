const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return new Promise((resolve) => {
        resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.Speaker",
            "version": "3",
            "properties": {
                "supported": [
                    {
                        "name": "volume"
                    },
                    {
                        "name": "muted"
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
            "uri": "ssap://audio/getVolume"
        };
        lgtvControl.lgtvCommand(udn, command, (error, response) => {
            if (error) {
                resolve([]);
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
            resolve([
                volumeState,
                mutedState
            ]);
        });
    });
}

function handler(lgtvControl, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.Speaker") {
            resolve(namespaceErrorResponse(event, "Alexa.Speaker"));
        }
        switch (event.directive.header.name) {
            case "SetVolume":
                resolve(setVolumeHandler(lgtvControl, event));
                break;
            case "AdjustVolume":
                resolve(adjustVolumeHandler(lgtvControl, event));
                break;
            case "SetMute":
                resolve(setMuteHandler(lgtvControl, event));
                break;
            default:
                resolve(unknownDirectiveError(lgtvControl, event));
                break;
        }
    });
}

function setVolumeHandler(lgtvControl, event) {
    return new Promise((resolve) => {
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
            resolve(alexaResponse.get());
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

function adjustVolumeHandler(lgtvControl, event) {
    return new Promise((resolve) => {
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
                resolve(alexaResponse.get());
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
                resolve(alexaResponse.get());
                return;
            }
            let {volume} = response;
            if (event.directive.payload.volumeDefault === true) {
                if (event.directive.payload.volume < 0) {
                    volume -= 3;
                } else if (event.directive.payload.volume > 0) {
                    volume += 3;
                }
            } else {
                volume += event.directive.payload.volume;
            }
            if (volume < 0) {
                volume = 0;
            }
            if (volume > 100) {
                volume = 100;
            }

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
                    resolve(alexaResponse.get());
                    return;
                }
                const alexaResponse = new AlexaResponse({
                    "request": event
                });
                resolve(alexaResponse.get());
            });
        });
    });
}

function setMuteHandler(lgtvControl, event) {
    return new Promise((resolve) => {
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

function unknownDirectiveError(_lgtvControl, event) {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `I do not know the Alexa Speaker directive ${event.directive.header.name}`
    );
}

function namespaceErrorResponse(event, namespace) {
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `You were sent to ${namespace} processing in error.`
    );
}

function errorResponse(event, type, message) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": type,
                "message": message
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