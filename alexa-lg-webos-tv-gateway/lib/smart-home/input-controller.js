const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return {
        "type": "AlexaInterface",
        "interface": "Alexa.InputController",
        "version": "3"
    };
}

function handler(lgtvControl, event, callback) {
    if (event.directive.header.namespace !== "Alexa.InputController") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Input Controller processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    switch (event.directive.header.name) {
        case "SelectInput":
            selectInputHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (error, response) => callback(error, response));
    }
}

function selectInputHandler(lgtvControl, event, callback) {
    const {endpointId} = event.directive.endpoint;

    const getExternalInputList = {
        "uri": "ssap://tv/getExternalInputList"
    };
    lgtvControl.lgtvCommand(endpointId, getExternalInputList, (error, response) => {
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
        if (!Reflect.has(response, "devices")) {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": "The T.V. did not return a list of it's external inputs."
                }
            });
            callback(null, alexaResponse.get());
            return;
        }

        const input = event.directive.payload.input.toUpperCase();
        let device = null;
        let index = 0;
        for (index = 0; index < response.devices.length; index += 1) {
            const id = response.devices[index].id.toUpperCase();
            const label = response.devices[index].label.toUpperCase();
            if (id === input) {
                device = id;
            }
            if (id === input.replace(/ /g, "_")) {
                device = id;
            }
            if (label === input) {
                device = id;
            }
            if (label === input.replace(/ /g, "_")) {
                device = id;
            }
        }
        if (device === null) {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": `I do not recognize input ${input}`
                }
            });
            callback(null, alexaResponse.get());
            return;
        }

        const setExternalInputList = {
            "uri": "ssap://tv/switchInput",
            "payload": {"inputId": device}
        };
        // eslint-disable-next-line no-unused-vars
        lgtvControl.lgtvCommand(endpointId, setExternalInputList, (err, _res) => {
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

function unknownDirectiveError(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Input Controller directive ${event.directive.header.name}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "capabilities": capabilities,
    "handler": handler
};