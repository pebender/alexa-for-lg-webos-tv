import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../common";

function capabilities(): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [AlexaResponse.buildPayloadEndpointCapability({
        "namespace": "Alexa.PowerController",
        "propertyNames": ["powerState"]
    })];
}

function states(): Promise<AlexaResponseContextProperty>[] {
    function value(): "ON" | "OFF" {
        return "OFF";
    }
    const powerStateState = AlexaResponse.buildContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": value
    });
    return [powerStateState];
}

function turnOffHandler(alexaRequest: AlexaRequest): AlexaResponse {
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function turnOnHandler(alexaRequest: AlexaRequest): AlexaResponse {
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(alexaRequest: AlexaRequest): AlexaResponse {
    if (alexaRequest.directive.header.namespace !== "Alexa.PowerController") {
        return namespaceErrorResponse(alexaRequest, alexaRequest.directive.header.namespace);
    }
    switch (alexaRequest.directive.header.name) {
    case "TurnOff":
        return turnOffHandler(alexaRequest);
    case "TurnOn":
        return turnOnHandler(alexaRequest);
    default:
        return directiveErrorResponse(alexaRequest, alexaRequest.directive.header.namespace);
    }
}

export {capabilities, states, handler};