import {AlexaRequest, AlexaResponse, AlexaResponseContextProperty} from "alexa-lg-webos-tv-common";
const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("alexa-lg-webos-tv-common");
import {UDN} from "../../common";
import {BackendController} from "../../backend";

const alexaToLGTV: {[key: string]: string} = {
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
const lgtvToAlexa: {[key: string]: string} = {
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
function capabilities(_lgtv: BackendController, _event: AlexaRequest, _udn: UDN) {
    return [
        {
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
        }
    ];
}

async function states(lgtv: BackendController, udn: UDN): Promise<any[]> {
    const lgtvInputList: {[key: string]: string} = await getExternalInputList();
    const lgtvAppId: string = await getInput();
    const alexaInput: string | null = mapInput(lgtvInputList, lgtvAppId);
    return buildStates(alexaInput);

    async function getExternalInputList() {
        if (lgtv.getPowerState(udn) === "OFF") {
            return [];
        }

        const command = {
            "uri": "ssap://tv/getExternalInputList"
        };
        const lgtvResponse = await lgtv.lgtvCommand(udn, command);
        if (Reflect.has(lgtvResponse, "devices") === false) {
            return [];
        }
        return lgtvResponse.devices;
    }

    async function getInput() {
        if (lgtv.getPowerState(udn) === "OFF") {
            return null;
        }
        const command = {
            "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
        };
        const lgtvResponse = await lgtv.lgtvCommand(udn, command);
        return lgtvResponse.appId;
    }

    function mapInput(inputList: any, appId: string): string {
        let input = null;
        if (appId !== null) {
            inputList.forEach((value: any) => {
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
        return input;
    }

    function buildStates(input: any) {
        if (input === null) {
            return [];
        }
        const inputState = new AlexaResponseContextProperty({
            "namespace": "Alexa.InputController",
            "name": "input",
            "value": input
        });
        return [inputState];
    }
}

function handler(lgtv: BackendController, event: AlexaRequest): Promise<AlexaResponse> {
    if (event.directive.header.namespace !== "Alexa.InputController") {
        return namespaceErrorResponse(event, "Alexa.InputController");
    }
    switch (event.directive.header.name) {
    case "SelectInput":
        return selectInputHandler(lgtv, event);
    default:
        return directiveErrorResponse(lgtv, event);
    }
}

async function selectInputHandler(lgtv: BackendController, event: AlexaRequest): Promise<AlexaResponse> {
    const lgtvInputList = await getExternalInputList();
    const lgtvAppId = await getInput();
    const lgtvInput = mapInput(lgtvInputList, lgtvAppId);
    return setExternalInput(lgtvInput);

    async function getExternalInputList(): Promise<{id: string, label: string, [x: string]: any}[]> {
        const {endpointId} = event.directive.endpoint;
        if (lgtv.getPowerState(endpointId) === "OFF") {
            return [];
        }

        const command = {
            "uri": "ssap://tv/getExternalInputList"
        };
        const lgtvResponse = await lgtv.lgtvCommand(endpointId, command);
        if (!Reflect.has(lgtvResponse, "devices")) {
            return [];
        }
        return lgtvResponse.devices;
    }

    function getInput(): string {
        return event.directive.payload.input.toUpperCase();
    }

    function mapInput(inputList: {id: string, label: string, [x: string]: any}[], inputItem: string): string {
        let input = inputItem;
        if (Reflect.has(alexaToLGTV, inputItem)) {
            input = alexaToLGTV[inputItem];
        }
        let device = null;
        inputList.forEach((value: any) => {
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
        return device;
    }

    async function setExternalInput(input: any | null): Promise<AlexaResponse> {
        if (input === null) {
            return errorResponse(
                event,
                "INTERNAL_ERROR",
                "I do not recognize the input."
            );
        }

        const {endpointId} = event.directive.endpoint;

        if (lgtv.getPowerState(endpointId) === "OFF") {
            const alexaResponse = new AlexaResponse({
                "alexaRequest": event
            });
            return alexaResponse.get();
        }

        const command = {
            "uri": "ssap://tv/switchInput",
            "payload": {"inputId": input}
        };
        await lgtv.lgtvCommand(endpointId, command);
        const alexaResponse = new AlexaResponse({
            "alexaRequest": event
        });
        return alexaResponse.get();
    }
}

export {capabilities, states, handler};