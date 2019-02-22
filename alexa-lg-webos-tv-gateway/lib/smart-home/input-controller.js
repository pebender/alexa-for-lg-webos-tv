const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("../common");

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
function capabilities(_lgtvController, _event, _udn) {
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

function states(lgtvController, udn) {
    return Promise.all([
            getExternalInputList(),
            getInput()
        ]).
        then(mapInput).
        then(buildStates);

    function getExternalInputList() {
        return new Promise((resolve) => {
            if (lgtvController.getPowerState(udn) === "OFF") {
                resolve([]);
                return;
            }

            const command = {
                "uri": "ssap://tv/getExternalInputList"
            };
            resolve(lgtvController.lgtvCommand(udn, command).
                then((response) => {
                    if (!Reflect.has(response, "devices")) {
                        return [];
                    }
                    return response.devices;
                }));
        });
    }

    function getInput() {
        return new Promise((resolve) => {
            if (lgtvController.getPowerState(udn) === "OFF") {
                resolve(null);
                return;
            }

            const command = {
                "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
            };
            resolve(lgtvController.lgtvCommand(udn, command).
                then((response) => response.appId));
            });
    }

    function mapInput(args) {
        return new Promise((resolve) => {
            // eslint-disable-next-line array-element-newline
            const [inputList, appId] = args;

            let input = null;
            if (appId !== null) {
                inputList.forEach((value) => {
                    if (value.appId === appId) {
                        input = value.id;
                        if (Reflect.has(lgtvToAlexa, input)) {
                            input = lgtvToAlexa[input];
                        } else {
                            input = input.replace("_", " ");
                        }
                    }
                });
            }
            resolve(input);
        });
    }

    function buildStates(input) {
        return new Promise((resolve) => {
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
    }
}

function handler(lgtvController, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.InputController") {
            resolve(namespaceErrorResponse(event, "Alexa.InputController"));
            return;
        }
        switch (event.directive.header.name) {
            case "SelectInput":
                resolve(selectInputHandler(lgtvController, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtvController, event));
                break;
        }
    });
}

function selectInputHandler(lgtvController, event) {
    return Promise.all(
            getExternalInputList,
            getInput
        ).
        then(mapInput).
        then(setExternalInput);

    function getExternalInputList() {
        const {endpointId} = event.directive.endpoint;
        return new Promise((resolve) => {
            if (lgtvController.getPowerState(endpointId) === "OFF") {
                resolve([]);
                return;
            }

            const command = {
                "uri": "ssap://tv/getExternalInputList"
            };
            resolve(lgtvController.lgtvCommand(endpointId, command).
                then((response) => {
                    if (!Reflect.has(response, "devices")) {
                        return [];
                    }
                    return response.devices;
                }));
        });
    }

    function getInput() {
        return new Promise((resolve) => {
            resolve(event.directive.payload.input.toUpperCase());
        });
    }

    function mapInput(responses) {
        return new Promise((resolve) => {
            const [inputList] = responses;
            let [, input] = responses;

            if (Reflect.has(alexaToLGTV, input)) {
                input = alexaToLGTV[input];
            }
            let device = null;
            inputList.forEach((value) => {
                const id = value.id.toUpperCase();
                const label = value.label.toUpperCase();
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
            });
            resolve(device);
        });
    }

    function setExternalInput(input) {
        return new Promise((resolve) => {
            if (lgtvController.getPowerState(endpointId) === "OFF") {
                resolve([]);
                return;
            }

            if (input === null) {
                resolve(errorResponse(
                    event,
                    "INTERNAL_ERROR",
                    "I do not recognize the input."
                ));
                return;
            }

            const {endpointId} = event.directive.endpoint;
            const command = {
                "uri": "ssap://tv/switchInput",
                "payload": {"inputId": input}
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

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};