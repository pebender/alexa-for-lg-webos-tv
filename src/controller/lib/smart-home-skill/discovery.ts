import * as alexa from "./alexa";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {AlexaRequest,
    AlexaResponse,
    AlexaResponseEventPayloadEndpoint,
    errorToErrorResponse,
    namespaceErrorResponse} from "../../../common";
import {Gateway} from "../gateway-api";

async function gatewayEndpoint(alexaRequest: AlexaRequest): Promise<AlexaResponseEventPayloadEndpoint> {
    try {
        const capabilitiesList = await Promise.all([
            Promise.resolve(alexa.capabilities(alexaRequest)),
            Promise.resolve(alexaPowerController.capabilities(alexaRequest)),
            Promise.resolve(alexaEndpointHealth.capabilities(alexaRequest)),
            Promise.resolve(alexaRangeController.capabilities(alexaRequest))
        ]);
        // Convert from a two dimensional array to a one dimensional array.
        const capabilities = [].concat(...capabilitiesList);
        if (capabilities.length === 0) {
            return null;
        }
        const endpoint: AlexaResponseEventPayloadEndpoint = {
            "endpointId": "lg-webos-tv-gateway",
            "friendlyName": "LGTV Gateway",
            "description": "LG webOS TV Gateway",
            "manufacturerName": "Paul Bender",
            "displayCategories": ["OTHER"],
            "capabilities": capabilities
        };
        return endpoint;
    } catch (_error) {
        return null;
    }
}

async function handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Discovery") {
        return namespaceErrorResponse(alexaRequest, alexaRequest.directive.header.namespace);
    }

    const gateway = new Gateway("");

    let alexaResponse = null;
    let lgtvGatewayEndpoint = null;

    try {
        alexaResponse = await gateway.sendSkillDirective(alexaRequest);
    } catch (error) {
        alexaResponse = null;
        return errorToErrorResponse(alexaRequest, error);
    }
    await gateway.send({"path": Gateway.skillPath()}, {"log": alexaResponse});

    try {
        lgtvGatewayEndpoint = await gatewayEndpoint(alexaRequest);
    } catch (error) {
        lgtvGatewayEndpoint = null;
        return errorToErrorResponse(alexaRequest, error);
    }
    await gateway.send({"path": Gateway.skillPath()}, {"log": alexaResponse});
    await gateway.send({"path": Gateway.skillPath()}, {"log": lgtvGatewayEndpoint});

    if (lgtvGatewayEndpoint === null) {
        return alexaResponse;
    }

    if ((alexaResponse.event.header.namespace === "Alexa.Discovery" &&
        alexaResponse.event.header.name === "Discover.Response") === false) {
        await gateway.send({"path": Gateway.skillPath()}, {"log": alexaResponse});
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