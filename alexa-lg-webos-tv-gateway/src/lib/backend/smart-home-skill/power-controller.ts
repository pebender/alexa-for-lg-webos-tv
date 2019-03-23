import {directiveErrorResponse, namespaceErrorResponse, errorResponse} from "alexa-lg-webos-tv-common";
import {AlexaRequest, AlexaResponse, AlexaResponseEventPayloadEndpointCapabilityInput, AlexaResponseContextPropertyInput} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
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

function states(lgtv: BackendController, udn: UDN): AlexaResponseContextPropertyInput[] {
    const powerStateState = AlexaResponse.createContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": lgtv.getPowerState(udn)
    });
    return [powerStateState];
}

function handler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PowerController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.PowerController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(lgtv, alexaRequest);
        case "TurnOn":
            return turnOnHandler(lgtv, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.PowerController"));
    }
}

async function turnOffHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const {endpointId} = alexaRequest.directive.endpoint;

    const poweredOff = await lgtv.turnOff(endpointId);
    if (poweredOff === false) {
        return errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOff for LGTV ${endpointId} failed.`);

    }
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "Response"
    });
}

async function turnOnHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const {endpointId} = alexaRequest.directive.endpoint;
    const poweredOn = await lgtv.turnOn(endpointId);
    if (poweredOn === false) {
        return errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOn for LGTV ${endpointId} failed.`);
    }
    return new AlexaResponse({
        "request": alexaRequest,
        "namespace": "Alexa",
        "name": "Response"
    });
}

export {capabilities, states, handler};