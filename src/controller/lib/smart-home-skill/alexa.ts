import * as ASH from "../../../common/alexa";

function capabilities(): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
    return [ASH.Response.buildPayloadEndpointCapability({
        "namespace": "Alexa"
    })];
}

function states(): Promise<ASH.ResponseContextProperty>[] {
    return [];
}

function reportStateHandler(alexaRequest: ASH.Request): Promise<ASH.Response> {
    return Promise.resolve(new ASH.Response({
        "namespace": "Alexa",
        "name": "StateReport",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    }));
}

function handler(alexaRequest: ASH.Request): Promise<ASH.Response> {
    if (alexaRequest.directive.header.namespace !== "Alexa") {
        return Promise.resolve(ASH.errorResponseForWrongNamespace(alexaRequest, alexaRequest.directive.header.namespace));
    }

    switch (alexaRequest.directive.header.name) {
    case "ReportState":
        return reportStateHandler(alexaRequest);
    default:
        return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
    }
}

export {capabilities, states, handler};