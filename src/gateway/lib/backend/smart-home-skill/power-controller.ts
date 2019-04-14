import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "../../../../common";
import {BackendControl} from "../../backend";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backendConrol: BackendControl): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        Promise.resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.PowerController",
            "version": "3",
            "properties": {
                "supported": [
                    {
                        "name": "powerState"
                    }
                ],
                "proactivelyReported": false,
                "retrievable": true
            }
        })
    ];
}

function states(backendControl: BackendControl): Promise<AlexaResponseContextProperty>[] {
    function value(): "ON" | "OFF" {
        return backendControl.getPowerState();
    }

    const powerStateState = AlexaResponse.buildContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": value
    });
    return [powerStateState];
}

async function turnOffHandler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    const poweredOff = await backendControl.turnOff();
    if (poweredOff === false) {
        return errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOff for LGTV ${backendControl.tv.udn} failed.`);
    }
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

async function turnOnHandler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    const poweredOn = await backendControl.turnOn();
    if (poweredOn === false) {
        return errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOn for LGTV ${backendControl.tv.udn} failed.`);
    }
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PowerController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.PowerController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(alexaRequest, backendControl);
        case "TurnOn":
            return turnOnHandler(alexaRequest, backendControl);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.PowerController"));
    }
}

export {capabilities, states, handler};