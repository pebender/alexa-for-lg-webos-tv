const {AlexaResponse} = require("alexa-lg-webos-tv-common");

const alexaToLGTV = {
    "HDMI 1": "HDMI_1",
    "HDMI 2": "HDMI_2",
    "HDMI 3": "HDMI_3",
    "HDMI 4": "HDMI_4",
    "HDMI 5": "HDMI_5",
    "HDMI 6": "HDMI_6",
    "HDMI 7": "HDMI_7",
    "HDMI 8": "HDMI_8",
    "HDMI 9": "HDMI_9",
    "HDMI 10": "HDMI_10",
    "INPUT 1": "HDMI_1",
    "INPUT 2": "HDMI_2",
    "INPUT 3": "HDMI_3",
    "INPUT 4": "HDMI_4",
    "INPUT 5": "HDMI_5",
    "INPUT 6": "HDMI_6",
    "INPUT 7": "HDMI_7",
    "INPUT 8": "HDMI_8",
    "INPUT 9": "HDMI_9",
    "INPUT 10": "HDMI_10",
    "VIDEO 1": "AV_1",
    "VIDEO 2": "AV_2",
    "VIDEO 3": "AV_3"
};
const lgtvToAlexa = {
    "HDMI_1": "HDMI 1",
    "HDMI_2": "HDMI 2",
    "HDMI_3": "HDMI 3",
    "HDMI_4": "HDMI 4",
    "HDMI_5": "HDMI 5",
    "HDMI_6": "HDMI 6",
    "HDMI_7": "HDMI 7",
    "HDMI_8": "HDMI 8",
    "HDMI_9": "HDMI 9",
    "HDMI_10": "HDMI 10",
    "AV_1": "VIDEO 1",
    "AV_2": "VIDEO 2",
    "AV_3": "VIDEO 3"
};

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return {
        "type": "AlexaInterface",
        "interface": "Alexa.InputController",
        "version": "3",
        "properties": {
            "supported": [
                {
                    "name": "input"
                }
            ],
            "proactivelyReported": false,
            "retrievable": false
        }

    };
}

function states(lgtvControl, udn, callback) {
    if (lgtvControl.getPowerState(udn) === "OFF") {
        callback(null, []);
        return;
    }

    const getExternalInputList = {
        "uri": "ssap://tv/getExternalInputList"
    };
    lgtvControl.lgtvCommand(udn, getExternalInputList, (error, response) => {
        if (error) {
            callback(null, []);
            return;
        }
        const inputs = response.devices;
        const getForegroundAppInfo = {
            "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
        };
        lgtvControl.lgtvCommand(udn, getForegroundAppInfo, (err, res) => {
            if (err) {
                callback(null, []);
                return;
            }
            const {appId} = res;
            let input = null;
            let index = 0;
            for (index = 0; index < inputs.length; index += 1) {
                if (inputs[index].appId === appId) {
                    input = inputs[index].id;
                    if (Reflect.has(lgtvToAlexa, input)) {
                        input = lgtvToAlexa[input];
                    } else {
                        input = inputs.replace("_", " ");
                    }
                }
            }
            if (input === null) {
                callback(null, []);
                return;
            }
            const inputState = AlexaResponse.createContextProperty({
                "namespace": "Alexa.InputController",
                "name": "input",
                "value": input
            });
            callback(null, [inputState]);
        });
    });
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

        let input = event.directive.payload.input.toUpperCase();
        if (Reflect.has(alexaToLGTV, input)) {
            input = alexaToLGTV[input];
        }
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
    "states": states,
    "handler": handler
};