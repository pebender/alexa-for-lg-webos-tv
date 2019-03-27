import {AlexaResponse,
    directiveErrorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {Gateway} from "../gateway-api";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_event): any[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.EndpointHealth",
            "version": "3",
            "properties": {
                "supported": [
                    {
                        "name": "connectivity"
                    }
                ],
                "proactivelyReported": false,
                "retrievable": true
            }
        }
    ];
}

async function states(): Promise<any[]> {
    const gateway = new Gateway("");
    try {
        await gateway.ping();
        const connectivityState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.EndpointHealth",
            "name": "connectivity",
            "value": "OK"
        });
        return [connectivityState];
    } catch (_error) {
        const connectivityState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.EndpointHealth",
            "name": "connectivity",
            "value": "UNREACHABLE"
        });
        return [connectivityState];
    }
}

function handler(event): Promise<any> {
    if (event.directive.header.namespace !== "Alexa.EndpointHealth") {
        return Promise.resolve(namespaceErrorResponse(event, event.directive.header.namespace));
    }
    switch (event.directive.header.name) {
        default:
            return Promise.resolve(directiveErrorResponse(event, event.directive.header.namespace));
    }
}

export {capabilities, states, handler};