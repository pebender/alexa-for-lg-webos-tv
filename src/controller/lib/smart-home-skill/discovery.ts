import * as ASH from "../../../common/alexa";
import {Gateway} from "../gateway-api";
import {capabilities as alexaSmartHomeCapabilities} from "./index";

async function gatewayEndpoint(): Promise<ASH.ResponseEventPayloadEndpoint | null> {
    try {
        let capabilities: ASH.ResponseEventPayloadEndpointCapability[] = [];
        try {
            // Determine capabilities in parallel.
            capabilities = await Promise.all(alexaSmartHomeCapabilities());
        } catch (error) {
            capabilities = [];
        }
        if (capabilities.length === 0) {
            return null;
        }
        const endpoint: ASH.ResponseEventPayloadEndpoint = {
            "endpointId": "lg-webos-tv-gateway",
            "friendlyName": "LGTV Gateway",
            "description": "LG webOS TV Gateway",
            "manufacturerName": "Paul Bender",
            "displayCategories": ["OTHER"],
            "capabilities": []
        };
        capabilities.forEach((capability): void => {
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

async function handler(alexaRequest: ASH.Request): Promise<ASH.Response> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Discovery") {
        return ASH.errorResponseForWrongNamespace(alexaRequest, alexaRequest.directive.header.namespace);
    }

    const gateway: Gateway = new Gateway("");

    let alexaResponse: ASH.Response | null = null;
    let lgtvGatewayEndpoint: ASH.ResponseEventPayloadEndpoint | null = null;

    try {
        alexaResponse = await gateway.sendSkillDirective(alexaRequest);
    } catch (error) {
        alexaResponse = ASH.errorResponseFromError(alexaRequest, error);
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
        alexaResponse = new ASH.Response({
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response"
        });
    }

    try {
        await alexaResponse.addPayloadEndpoint(lgtvGatewayEndpoint);
    } catch (error) {
        return ASH.errorResponseFromError(alexaRequest, error);
    }

    return alexaResponse;
}

export {handler};