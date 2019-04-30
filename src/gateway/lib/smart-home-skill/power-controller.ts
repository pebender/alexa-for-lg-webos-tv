import * as ASH from  "../../../common/alexa";
import {BackendControl} from "../backend";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backendControl: BackendControl): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
    return [ASH.Response.buildPayloadEndpointCapability({
        "namespace": "Alexa.PowerController",
        "propertyNames": ["powerState"]
    })];
}

function states(backendControl: BackendControl): Promise<ASH.ResponseContextProperty>[] {
    function value(): "ON" | "OFF" {
        return backendControl.getPowerState();
    }

    const powerStateState = ASH.Response.buildContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": value
    });
    return [powerStateState];
}

async function turnOffHandler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    const poweredOff = await backendControl.turnOff();
    if (poweredOff === false) {
        return ASH.errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOff for LGTV ${backendControl.tv.udn} failed.`);
    }
    return new ASH.Response({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

async function turnOnHandler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    const poweredOn = await backendControl.turnOn();
    if (poweredOn === false) {
        return ASH.errorResponse(alexaRequest, "INTERNAL_ERROR", `Alexa.PowerController.turnOn for LGTV ${backendControl.tv.udn} failed.`);
    }
    return new ASH.Response({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    if (alexaRequest.directive.header.namespace !== "Alexa.PowerController") {
        return Promise.resolve(ASH.errorResponseForWrongNamespace(alexaRequest, "Alexa.PowerController"));
    }
    switch (alexaRequest.directive.header.name) {
    case "TurnOff":
        return turnOffHandler(alexaRequest, backendControl);
    case "TurnOn":
        return turnOnHandler(alexaRequest, backendControl);
    default:
        return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
    }
}

export {capabilities, states, handler};