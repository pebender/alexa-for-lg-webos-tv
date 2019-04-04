import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../common";
import {Gateway} from "../gateway-api";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_alexaRequest: AlexaRequest): AlexaResponseEventPayloadEndpointCapability[] {
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

function states(): Promise<AlexaResponseContextProperty>[] {
    async function value(): Promise<"OK" | "UNREACHABLE"> {
        try {
            const gateway = new Gateway("");
            await gateway.ping();
            return "OK";
        } catch (_error) {
            return "UNREACHABLE";
        }
    }

    const connectivityState = AlexaResponse.buildContextProperty({
        "namespace": "Alexa.EndpointHealth",
        "name": "connectivity",
        "value": value
    });
    return [connectivityState];
}

function handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.EndpointHealth") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
    }
    switch (alexaRequest.directive.header.name) {
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
    }
}

export {capabilities, states, handler};