const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {errorToErrorResponse, directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("../common");

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
    return new Promise((resolve) => {
        resolve({
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
                "retrievable": true
            }
        });
    });
}

function states(lgtvControl, udn) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        if (lgtvControl.getPowerState(udn) === "OFF") {
            resolve([]);
            return;
        }

        const getExternalInputList = {
            "uri": "ssap://tv/getExternalInputList"
        };
        lgtvControl.lgtvCommand(udn, getExternalInputList, (error, response) => {
            if (error) {
                resolve([]);
                return;
            }
            const inputs = response.devices;
            const getForegroundAppInfo = {
                "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
            };
            lgtvControl.lgtvCommand(udn, getForegroundAppInfo, (err, res) => {
                if (err) {
                    resolve([]);
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
                    resolve([]);
                    return;
                }
                const inputState = AlexaResponse.createContextProperty({
                    "namespace": "Alexa.InputController",
                    "name": "input",
                    "value": input
                });
                resolve([inputState]);
            });
        });
    });
}

function handler(lgtvControl, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.InputController") {
            resolve(namespaceErrorResponse(event, "Alexa.InputController"));
            return;
        }
        switch (event.directive.header.name) {
            case "SelectInput":
                resolve(selectInputHandler(lgtvControl, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtvControl, event));
                break;
        }
    });
}

function selectInputHandler(lgtvControl, event) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;

        const getExternalInputList = {
            "uri": "ssap://tv/getExternalInputList"
        };
        lgtvControl.lgtvCommand(endpointId, getExternalInputList, (error, response) => {
            if (error) {
                resolve(errorToErrorResponse(event, error));
                return;
            }
            if (!Reflect.has(response, "devices")) {
                resolve(errorResponse(
                    event,
                    "INTERNAL_ERROR",
                    "The T.V. did not return a list of it's external inputs."
                ));
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
                resolve(errorResponse(
                    event,
                    "INTERNAL_ERROR",
                    `I do not recognize input ${input}`
                ));
                return;
            }

            const setExternalInputList = {
                "uri": "ssap://tv/switchInput",
                "payload": {"inputId": device}
            };
            // eslint-disable-next-line no-unused-vars
            lgtvControl.lgtvCommand(endpointId, setExternalInputList, (err, _res) => {
                if (err) {
                    resolve(errorToErrorResponse(event, err));
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

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};