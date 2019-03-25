import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextPropertyInput,
    AlexaResponseEventPayloadEndpointCapabilityInput,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "../../backend";
import {UDN} from "../../common";

// eslint-disable-next-line no-unused-vars
function capabilities(_backendController: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.PowerController",
            "version": "3",
            "supported": [
                {
                    "name": "powerState"
                }
            ],
            "proactivelyReported": false,
            "retrievable": true
        }
    ];
}

function states(backendController: BackendController, udn: UDN): AlexaResponseContextPropertyInput[] {
    const powerStateState = AlexaResponse.createContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": backendController.getPowerState(udn)
    });
    return [powerStateState];
}

async function turnOffHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);

    const poweredOff = await backendController.turnOff(udn);
    if (poweredOff === false) {
        return errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOff for LGTV ${udn} failed.`);

    }
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "Response"
    });
}

async function turnOnHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
    const poweredOn = await backendController.turnOn(udn);
    if (poweredOn === false) {
        return errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOn for LGTV ${udn} failed.`);
    }
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "Response"
    });
}

function handler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PowerController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.PowerController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(backendController, alexaRequest);
        case "TurnOn":
            return turnOnHandler(backendController, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.PowerController"));
    }
}

export {capabilities, states, handler};