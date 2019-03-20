const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("alexa-lg-webos-tv-common");
import {AlexaRequest, AlexaResponse, AlexaResponseContextProperty} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _event: AlexaRequest, _udn: UDN) {
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

function states(lgtv: BackendController, udn: UDN): any[] {
    const powerStateState = new AlexaResponseContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": lgtv.getPowerState(udn)
    });
    return [powerStateState];
}

function handler(lgtv: BackendController, event: AlexaRequest) {
    if (event.directive.header.namespace !== "Alexa.PowerController") {
        return namespaceErrorResponse(event, "Alexa.PowerController");
    }
    switch (event.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(lgtv, event);
        case "TurnOn":
            return turnOnHandler(lgtv, event);
        default:
            return directiveErrorResponse(lgtv, event);
    }
}

async function turnOffHandler(lgtv: BackendController, event: AlexaRequest) {
    const {endpointId} = event.directive.endpoint;

    const poweredOff = await lgtv.turnOff(endpointId);
    if (poweredOff === false) {
        return errorResponse(event, "INTERNAL_ERROR", `Alexa.PowerController.turnOff for LGTV ${endpointId} failed.`);

    }
    const alexaResponse = new AlexaResponse({
        "alexaRequest": event
    });
    return alexaResponse.get();
}

async function turnOnHandler(lgtv: BackendController, event: AlexaRequest) {
    const {endpointId} = event.directive.endpoint;
    const poweredOn = await lgtv.turnOn(endpointId);
    if (poweredOn === false) {
        return errorResponse(event, "INTERNAL_ERROR", `Alexa.PowerController.turnOn for LGTV ${endpointId} failed.`);
    }
    const alexaResponse = new AlexaResponse({
        "alexaRequest": event
    });
    return alexaResponse.get();
}

export {capabilities, states, handler};