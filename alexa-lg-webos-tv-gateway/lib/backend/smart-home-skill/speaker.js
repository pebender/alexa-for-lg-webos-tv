const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv, _event, _udn) {
    return [
        {
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
        }
    ];
}

async function states(lgtv, udn) {
    if (lgtv.getPowerState(udn) === "OFF") {
        return [];
    }

    const command = {
        "uri": "ssap://audio/getVolume"
    };
    try {
        const lgtvResponse = await lgtv.lgtvCommand(udn, command);
        const volumeState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "volume",
            "value": lgtvResponse.volume
        });
        const mutedState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "muted",
            "value": lgtvResponse.muted
        });
        return [
            volumeState,
            mutedState
        ];
    } catch (error) {
        return [];
    }
}

function handler(lgtv, event) {
    if (event.directive.header.namespace !== "Alexa.Speaker") {
        return namespaceErrorResponse(event, "Alexa.Speaker");
    }
    switch (event.directive.header.name) {
        case "SetVolume":
            return setVolumeHandler(lgtv, event);
        case "AdjustVolume":
            return adjustVolumeHandler(lgtv, event);
        case "SetMute":
            return setMuteHandler(lgtv, event);
        default:
            return directiveErrorResponse(lgtv, event);
    }
}

async function setVolumeHandler(lgtv, event) {
    const lgtvVolume = await getVolume();
    return setVolume(lgtvVolume);

    function getVolume() {
        const {volume} = event.directive.payload;
        if ((volume < 0) || (volume > 100)) {
            return errorResponse(
                event,
                "VALUE_OUT_OF_RANGE",
                "volume must be between 0 and 100 inclusive."
            );
        }
        return volume;
    }

    async function setVolume(volume) {
        const {endpointId} = event.directive.endpoint;
        const command = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await lgtv.lgtvCommand(endpointId, command);
        const alexaResponse = new AlexaResponse({
            "request": event
        });
        return alexaResponse.get();
    }
}

async function adjustVolumeHandler(lgtv, event) {
    const lgtvVolume = await getVolume();
    return setVolume(lgtvVolume);

    function getVolume() {
        const {endpointId} = event.directive.endpoint;

        const command = {
            "uri": "ssap://audio/getVolume"
        };
        const lgtvResponse = lgtv.lgtvCommand(endpointId, command);
        if (Reflect.has(lgtvResponse, "volume") === false) {
            return errorResponse(
                event,
                "INTERNAL_ERROR",
                "The T.V. did not return it's volume."
            );
        }
        let {volume} = lgtvResponse;
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
    }

    async function setVolume(volume) {
        const {endpointId} = event.directive.endpoint;
        const command = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await lgtv.lgtvCommand(endpointId, command);
        const alexaResponse = new AlexaResponse({
            "request": event
        });
        return alexaResponse.get();
    }
}

function setMuteHandler(lgtv, event) {
    return setMute();

    async function setMute() {
        const {endpointId} = event.directive.endpoint;
        const command = {
            "uri": "ssap://audio/setMute",
            "payload": {"mute": event.directive.payload.mute}
        };
        await lgtv.lgtvCommand(endpointId, command);
        const alexaResponse = new AlexaResponse({
            "request": event
        });
        return alexaResponse.get();
    }
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};