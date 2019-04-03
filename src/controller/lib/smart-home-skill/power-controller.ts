import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_alexaRequest: AlexaRequest): AlexaResponseEventPayloadEndpointCapability[] {
    return [
        {
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
        }
    ];
}

function states(): AlexaResponseContextProperty[] {
    const powerStateState = AlexaResponse.createContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": "OFF"
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