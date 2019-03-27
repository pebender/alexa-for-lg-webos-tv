import {AlexaResponse,
    directiveErrorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_event): any[] {
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

function states(): any[] {
    const powerStateState = AlexaResponse.createContextProperty({
        "namespace": "Alexa.PowerController",
        "name": "powerState",
        "value": "OFF"
    });
    return [powerStateState];
}

function handler(event): any {
    if (event.directive.header.namespace !== "Alexa.PowerController") {
        return namespaceErrorResponse(event, event.directive.header.namespace);
    }
    switch (event.directive.header.name) {
        case "TurnOff":
            return turnOffHandler(event);
        case "TurnOn":
            return turnOnHandler(event);
        default:
            return directiveErrorResponse(event, event.directive.header.namespace);
    }
}

function turnOffHandler(event): any {
    return new AlexaResponse({
        "request": event
    });
}

function turnOnHandler(event): any {
    return new AlexaResponse({
        "request": event
    });
}

export {capabilities, states, handler};