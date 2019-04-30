import * as ASH from  "../../../common/alexa";
import {BackendControl} from "../backend";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backendControl: BackendControl): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
    return [ASH.Response.buildPayloadEndpointCapability({
        "namespace": "Alexa",
    })];
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(backendControl: BackendControl): Promise<ASH.ResponseContextProperty>[] {
    return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reportStateHandler(alexaRequest: ASH.Request, backendControl: BackendControl): ASH.Response {
    return new ASH.Response({
        "namespace": "Alexa.",
        "name": "StateReport",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    if (alexaRequest.directive.header.namespace !== "ASH.") {
        return Promise.resolve(ASH.errorResponseForWrongNamespace(alexaRequest, "Alexa"));
    }
    switch (alexaRequest.directive.header.name) {
    case "ReportState":
        return Promise.resolve(reportStateHandler(alexaRequest, backendControl));
    default:
        return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
    }
}

export {capabilities, states, handler};