const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("../common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvController, _event, _udn) {
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

function states(lgtvController, udn) {
    return new Promise((resolve) => {
        if (lgtvController.getPowerState(udn) === "OFF") {
            resolve([]);
            return;
        }

        const command = {
            "uri": "ssap://audio/getVolume"
        };
        resolve(lgtvController.lgtvCommand(udn, command).
            then((response) => {
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
                return [
                    volumeState,
                    mutedState
                ];
            }).
            catch(() => []));
    });
}

function handler(lgtvController, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.Speaker") {
            resolve(namespaceErrorResponse(event, "Alexa.Speaker"));
            return;
        }
        switch (event.directive.header.name) {
            case "SetVolume":
                resolve(setVolumeHandler(lgtvController, event));
                break;
            case "AdjustVolume":
                resolve(adjustVolumeHandler(lgtvController, event));
                break;
            case "SetMute":
                resolve(setMuteHandler(lgtvController, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtvController, event));
                break;
        }
    });
}

function setVolumeHandler(lgtvController, event) {
    return getVolume().
        then(setVolume);

    function getVolume() {
        return new Promise((resolve) => {
            const {volume} = event.directive.payload;
            if ((volume < 0) || (volume > 100)) {
                resolve(errorResponse(
                    event,
                    "VALUE_OUT_OF_RANGE",
                    "volume must be between 0 and 100 inclusive."
                ));
            }
            resolve(volume);
        });
    }
    function setVolume(volume) {
        return new Promise((resolve) => {
            const {endpointId} = event.directive.endpoint;
            const command = {
                "uri": "ssap://audio/setVolume",
                "payload": {"volume": volume}
            };
            // eslint-disable-next-line no-unused-vars
            resolve(lgtvController.lgtvCommand(endpointId, command).
                then(() => {
                    const alexaResponse = new AlexaResponse({
                        "request": event
                    });
                    return alexaResponse.get();
                }));
        });
    }
}

function adjustVolumeHandler(lgtvController, event) {
    return getVolume().
        then(setVolume);

    function getVolume() {
        return new Promise((resolve) => {
            const {endpointId} = event.directive.endpoint;

            const command = {
                "uri": "ssap://audio/getVolume"
            };
            resolve(lgtvController.lgtvCommand(endpointId, command).
                then((response) => {
                    if (!Reflect.has(response, "volume")) {
                        resolve(errorResponse(
                            event,
                            "INTERNAL_ERROR",
                            "The T.V. did not return it's volume."
                        ));
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
                    return volume;
                }));
        });
    }

    function setVolume(volume) {
        return new Promise((resolve) => {
            const {endpointId} = event.directive.endpoint;
            const command = {
                "uri": "ssap://audio/setVolume",
                "payload": {"volume": volume}
            };
            resolve(lgtvController.lgtvCommand(endpointId, command).
                then(() => {
                    const alexaResponse = new AlexaResponse({
                        "request": event
                    });
                    return alexaResponse.get();
                }));
        });
    }
}

function setMuteHandler(lgtvController, event) {
    return setMute();

    function setMute() {
        return new Promise((resolve) => {
            const {endpointId} = event.directive.endpoint;
            const command = {
                "uri": "ssap://audio/setMute",
                "payload": {"mute": event.directive.payload.mute}
            };
            resolve(lgtvController.lgtvCommand(endpointId, command).
                then(() => {
                    const alexaResponse = new AlexaResponse({
                        "request": event
                    });
                    return alexaResponse.get();
                }));
        });
    }
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};