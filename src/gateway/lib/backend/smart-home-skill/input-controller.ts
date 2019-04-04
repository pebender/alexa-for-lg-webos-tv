import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "../../../../common";
import {Backend} from "../../backend";
import {UDN} from "../../tv";

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
function capabilities(_backend: Backend, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapability[] {
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

function states(backend: Backend, udn: UDN): Promise<AlexaResponseContextProperty>[] {
    async function value(): Promise<string> {
        async function getExternalInputList(): Promise<{[x: string]: any}[]> {
            if (backend.getPowerState(udn) === "OFF") {
                return [];
            }

            const command = {
                "uri": "ssap://tv/getExternalInputList"
            };
            const lgtvResponse = await backend.lgtvCommand(udn, command);
            if (Reflect.has(lgtvResponse, "devices") === false) {
                return [];
            }
            return lgtvResponse.devices;
        }

        async function getInput(): Promise<string> {
            if (backend.getPowerState(udn) === "OFF") {
                return null;
            }
            const command = {
                "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
            };
            const lgtvResponse = await backend.lgtvCommand(udn, command);
            return lgtvResponse.appId;
        }
        const [
            inputList,
            appId
        ] = await Promise.all([
            getExternalInputList(),
            getInput()
        ]);

        let input = null;
        if (appId !== null) {
            inputList.forEach((item: any) => {
                if (item.appId === appId) {
                    input = item.id;
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

    const inputState = AlexaResponse.buildContextProperty({
        "namespace": "Alexa.InputController",
        "name": "input",
        "value": value
    });
    return [inputState];
}

async function selectInputHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    async function getExternalInputList(): Promise<{id: string; label: string; [x: string]: any}[]> {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
        if (backend.getPowerState(udn) === "OFF") {
            return [];
        }

        const command = {
            "uri": "ssap://tv/getExternalInputList"
        };
        const lgtvResponse = await backend.lgtvCommand(udn, command);
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

        if (backend.getPowerState(udn) === "OFF") {
            return new AlexaResponse({
                "namespace": "Alexa",
                "name": "Response",
                "correlationToken": alexaRequest.getCorrelationToken(),
                "endpointId": alexaRequest.getEndpointId()
            });
        }

        const command = {
            "uri": "ssap://tv/switchInput",
            "payload": {"inputId": input}
        };
        await backend.lgtvCommand(udn, command);
        return new AlexaResponse({
            "namespace": "Alexa",
            "name": "Response",
            "correlationToken": alexaRequest.getCorrelationToken(),
            "endpointId": alexaRequest.getEndpointId()
        });
    }

    const lgtvInputList = await getExternalInputList();
    const lgtvAppId = await getInput();
    const lgtvInput = mapInput(lgtvInputList, lgtvAppId);
    return setExternalInput(lgtvInput);
}

function handler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.InputController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.InputController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "SelectInput":
            return selectInputHandler(backend, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.InputController"));
    }
}

export {capabilities, states, handler};