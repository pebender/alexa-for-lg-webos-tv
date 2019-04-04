import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "../../../../common";
import {Backend} from "../../backend";
import {UDN} from "../../tv";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_backend: Backend, _alexaRequest: AlexaRequest, _udn: UDN): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
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

function states(backend: Backend, udn: UDN): Promise<AlexaResponseContextProperty>[] {
    function value(): "ON" | "OFF" {
        return backend.getPowerState(udn);
    }

    const powerStateState = AlexaResponse.buildContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": value
    });
    return [powerStateState];
}

async function turnOffHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);

    const poweredOff = await backend.turnOff(udn);
    if (poweredOff === false) {
        return errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOff for LGTV ${udn} failed.`);

    }
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

async function turnOnHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
    const poweredOn = await backend.turnOn(udn);
    if (poweredOn === false) {
        return errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOn for LGTV ${udn} failed.`);
    }
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PowerController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.PowerController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(backend, alexaRequest);
        case "TurnOn":
            return turnOnHandler(backend, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.PowerController"));
    }
}

export {capabilities, states, handler};