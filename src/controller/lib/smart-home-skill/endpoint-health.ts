import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    namespaceErrorResponse} from "../../../common";
import {Gateway} from "../gateway-api";

function capabilities(): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [AlexaResponse.buildPayloadEndpointCapability({
        "namespace": "Alexa.EndpointHealth",
        "propertyNames": ["connectivity"]
    })];
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