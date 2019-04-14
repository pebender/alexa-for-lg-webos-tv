import {AlexaRequest,
    AlexaResponse,
    AlexaResponseEventPayloadEndpoint,
    AlexaResponseEventPayloadEndpointCapability,
    errorToErrorResponse,
    namespaceErrorResponse} from "../../../common";
import {Gateway} from "../gateway-api";
import {capabilities as alexaSmartHomeCapabilities} from "./index";

async function gatewayEndpoint(): Promise<AlexaResponseEventPayloadEndpoint | null> {
    try {
        let capabilities: AlexaResponseEventPayloadEndpointCapability[] = [];
        try {
            // Determine capabilities in parallel.
            capabilities = await Promise.all(alexaSmartHomeCapabilities());
        } catch (error) {
            capabilities = [];
        }
        if (capabilities.length === 0) {
            return null;
        }
        const endpoint: AlexaResponseEventPayloadEndpoint = {
            "endpointId": "lg-webos-tv-gateway",
            "friendlyName": "LGTV Gateway",
            "description": "LG webOS TV Gateway",
            "manufacturerName": "Paul Bender",
            "displayCategories": ["OTHER"],
            "capabilities": []
        };
        capabilities.forEach((capability) => {
            if (typeof capability === "undefined" || capability === null) {
                return;
            }
            endpoint.capabilities.push(capability);
        });
        return endpoint;
    } catch (_error) {
        return null;
    }
}

async function handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Discovery") {
        return namespaceErrorResponse(alexaRequest, alexaRequest.directive.header.namespace);
    }

    const gateway: Gateway = new Gateway("");

    let alexaResponse: AlexaResponse | null = null;
    let lgtvGatewayEndpoint: AlexaResponseEventPayloadEndpoint | null = null;

    try {
        alexaResponse = await gateway.sendSkillDirective(alexaRequest);
    } catch (error) {
        alexaResponse = errorToErrorResponse(alexaRequest, error);
    }

    try {
        lgtvGatewayEndpoint = await gatewayEndpoint();
    } catch (error) {
        lgtvGatewayEndpoint = null;
    }

    if (lgtvGatewayEndpoint === null) {
        return alexaResponse;
    }

    if (alexaResponse.event.header.namespace !== "Alexa.Discovery" ||
        alexaResponse.event.header.name !== "Discover.Response") {
        alexaResponse = new AlexaResponse({
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response"
        });
    }

    try {
        await alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }

    return alexaResponse;
}

export {handler};