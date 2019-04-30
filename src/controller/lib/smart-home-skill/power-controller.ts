import * as ASH from "../../../common/alexa";

function capabilities(): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
    return [ASH.Response.buildPayloadEndpointCapability({
        "namespace": "Alexa.PowerController",
        "propertyNames": ["powerState"]
    })];
}

function states(): Promise<ASH.ResponseContextProperty>[] {
    function value(): "ON" | "OFF" {
        return "OFF";
    }
    const powerStateState = ASH.Response.buildContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": value
    });
    return [powerStateState];
}

function turnOffHandler(alexaRequest: ASH.Request): ASH.Response {
    return new ASH.Response({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function turnOnHandler(alexaRequest: ASH.Request): ASH.Response {
    return new ASH.Response({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(alexaRequest: ASH.Request): ASH.Response {
    if (alexaRequest.directive.header.namespace !== "Alexa.PowerController") {
        return ASH.errorResponseForWrongNamespace(alexaRequest, alexaRequest.directive.header.namespace);
    }
    switch (alexaRequest.directive.header.name) {
    case "TurnOff":
        return turnOffHandler(alexaRequest);
    case "TurnOn":
        return turnOnHandler(alexaRequest);
    default:
        return ASH.errorResponseForUnknownDirective(alexaRequest);
    }
}

export {capabilities, states, handler};