import * as ASH from  "../../../common/alexa";
import {BackendControl} from "../backend";
import LGTV from "lgtv2";

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
function capabilities(backendControl: BackendControl): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
    return [ASH.Response.buildPayloadEndpointCapability({
        "namespace": "Alexa.InputController",
        "propertyNames": ["input"]
    })];
}

function states(backendControl: BackendControl): Promise<ASH.ResponseContextProperty>[] {
    async function value(): Promise<string | null> {
        async function getExternalInputList(): Promise<LGTV.ResponseExternalInputListDevice[]> {
            if (backendControl.getPowerState() === "OFF") {
                return [];
            }

            const lgtvRequest: LGTV.Request = {
                "uri": "ssap://tv/getExternalInputList"
            };
            const lgtvResponse: LGTV.ResponseExternalInputList = (await backendControl.lgtvCommand(lgtvRequest) as LGTV.ResponseExternalInputList);
            if (typeof lgtvResponse.devices === "undefined") {
                return [];
            }
            if (typeof lgtvResponse.devices === "undefined") {
                throw new Error("invalid LGTVResponse message");
            }
            return lgtvResponse.devices;
        }

        async function getInput(): Promise<string | null> {
            if (backendControl.getPowerState() === "OFF") {
                return null;
            }
            const lgtvRequest: LGTV.Request = {
                "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
            };
            const lgtvResponse: LGTV.ResponseForgroundAppInfo = (await backendControl.lgtvCommand(lgtvRequest) as LGTV.ResponseForgroundAppInfo);
            if (typeof lgtvResponse.appId === "undefined") {
                throw new Error("invalid LGTVResponse message");
            }
            return lgtvResponse.appId;
        }
        const [
            inputList,
            appId
        ] = await Promise.all([
            getExternalInputList(),
            getInput()
        ]);

        let input: string | null = null;
        if (appId !== null) {
            inputList.forEach((item): void => {
                if (item.appId === appId) {
                    input = item.id;
                    if (typeof lgtvToAlexa.input !== "undefined") {
                        input = lgtvToAlexa[input];
                    } else {
                        input = input.replace("_", " ");
                    }
                }
            });
        }
        return input;
    }

    const inputState = ASH.Response.buildContextProperty({
        "namespace": "Alexa.InputController",
        "name": "input",
        "value": value
    });
    return [inputState];
}

async function selectInputHandler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    async function getExternalInputList(): Promise<LGTV.ResponseExternalInputListDevice[]> {
        if (backendControl.getPowerState() === "OFF") {
            return [];
        }

        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://tv/getExternalInputList"
        };
        const lgtvResponse: LGTV.ResponseExternalInputList = (await backendControl.lgtvCommand(lgtvRequest) as LGTV.ResponseExternalInputList);
        if (typeof lgtvResponse.devices === "undefined") {
            return [];
        }
        return lgtvResponse.devices;
    }

    function getInput(): string {
        if (typeof alexaRequest.directive.payload.input !== "string") {
            return "";
        }
        return alexaRequest.directive.payload.input.toUpperCase();
    }

    function mapInput(inputList: LGTV.ResponseExternalInputListDevice[], inputItem: string): string | null {
        let input = inputItem;
        if (typeof alexaToLGTV[inputItem] !== "undefined") {
            input = alexaToLGTV[inputItem];
        }
        let device: string | null = null;
        inputList.forEach((value): void => {
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

    async function setExternalInput(input: string | null): Promise<ASH.Response> {
        if (input === null) {
            return ASH.errorResponse(
                alexaRequest,
                "INTERNAL_ERROR",
                "I do not recognize the input."
            );
        }

        if (backendControl.getPowerState() === "OFF") {
            return new ASH.Response({
                "namespace": "Alexa",
                "name": "Response",
                "correlationToken": alexaRequest.getCorrelationToken(),
                "endpointId": alexaRequest.getEndpointId()
            });
        }

        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://tv/switchInput",
            "payload": {"inputId": input}
        };
        await backendControl.lgtvCommand(lgtvRequest);
        return new ASH.Response({
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

function handler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    if (alexaRequest.directive.header.namespace !== "Alexa.InputController") {
        return Promise.resolve(ASH.errorResponseForWrongNamespace(alexaRequest, "Alexa.InputController"));
    }
    switch (alexaRequest.directive.header.name) {
    case "SelectInput":
        return selectInputHandler(alexaRequest, backendControl);
    default:
        return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
    }
}

export {capabilities, states, handler};