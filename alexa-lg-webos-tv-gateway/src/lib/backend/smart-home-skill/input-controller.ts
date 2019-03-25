import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextPropertyInput,
    AlexaResponseEventPayloadEndpointCapabilityInput,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "../../backend";
import {UDN} from "../../common";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_backendController: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.InputController",
            "version": "3",
            "supported": [{"name": "input"}],
            "proactivelyReported": false,
            "retrievable": true
        }
    ];
}

async function states(backendController: BackendController, udn: UDN): Promise<AlexaResponseContextPropertyInput[]> {
    async function getExternalInputList(): Promise<{[x: string]: any}[]> {
        if (backendController.getPowerState(udn) === "OFF") {
            return [];
        }

        const command = {
            "uri": "ssap://tv/getExternalInputList"
        };
        const lgtvResponse = await backendController.lgtvCommand(udn, command);
        if (Reflect.has(lgtvResponse, "devices") === false) {
            return [];
        }
        return lgtvResponse.devices;
    }

    async function getInput(): Promise<string> {
        if (backendController.getPowerState(udn) === "OFF") {
            return null;
        }
        const command = {
            "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
        };
        const lgtvResponse = await backendController.lgtvCommand(udn, command);
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

    function buildStates(input: any): AlexaResponseContextPropertyInput[] {
        if (input === null) {
            return [];
        }
        const inputState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.InputController",
            "name": "input",
            "value": input
        });
        return [inputState];
    }

    const lgtvInputList = await getExternalInputList();
    const lgtvAppId: string = await getInput();
    const alexaInput: string | null = mapInput(lgtvInputList, lgtvAppId);
    return buildStates(alexaInput);
}

async function selectInputHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    async function getExternalInputList(): Promise<{id: string; label: string; [x: string]: any}[]> {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
        if (backendController.getPowerState(udn) === "OFF") {
            return [];
        }

        const command = {
            "uri": "ssap://tv/getExternalInputList"
        };
        const lgtvResponse = await backendController.lgtvCommand(udn, command);
        if (!Reflect.has(lgtvResponse, "devices")) {
            return [];
        }
        return lgtvResponse.devices;
    }

    function getInput(): string {
        return alexaRequest.directive.payload.input.toUpperCase();
    }

    function mapInput(inputList: {id: string; label: string; [x: string]: any}[], inputItem: string): string {
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
                alexaRequest,
                "INTERNAL_ERROR",
                "I do not recognize the input."
            );
        }

        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);

        if (backendController.getPowerState(udn) === "OFF") {
            return new AlexaResponse({
                "request": alexaRequest,
                "namespace": "Alexa",
                "name": "Response"
            });
        }

        const command = {
            "uri": "ssap://tv/switchInput",
            "payload": {"inputId": input}
        };
        await backendController.lgtvCommand(udn, command);
        return new AlexaResponse({
            "request": alexaRequest,
            "namespace": "Alexa",
            "name": "Response"
        });
    }

    const lgtvInputList = await getExternalInputList();
    const lgtvAppId = await getInput();
    const lgtvInput = mapInput(lgtvInputList, lgtvAppId);
    return setExternalInput(lgtvInput);
}

function handler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.InputController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.InputController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "SelectInput":
            return selectInputHandler(backendController, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.InputController"));
    }
}

export {capabilities, states, handler};