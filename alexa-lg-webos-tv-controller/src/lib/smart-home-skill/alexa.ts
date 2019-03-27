import {AlexaResponse,
    directiveErrorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";

// eslint-disable-next-line @typescript-eslin/no-unused-vars
function capabilities(_event): any[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        }
    ];
}

function states(): any[] {
    return [];
}

function handler(event): Promise<any> {
    if (event.directive.header.namespace !== "Alexa") {
        return Promise.resolve(namespaceErrorResponse(event, event.directive.header.namespace));
    }

    switch (event.directive.header.name) {
        case "ReportState":
            return Promise.resolve(reportStateHandler(event));
        default:
            return Promise.resolve(directiveErrorResponse(event, event.directive.header.namespace));
    }
}

function reportStateHandler(event): any {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "namespace": "Alexa",
        "name": "StateReport"
    });
    return alexaResponse;
}

export {capabilities, states, handler};