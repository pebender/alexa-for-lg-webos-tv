import * as alexa from "./alexa";
import * as alexaAuthorization from "./authorization";
import * as alexaDiscovery from "./discovery";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {AlexaRequest,
    AlexaResponse,
    directiveErrorResponse,
    errorToErrorResponse} from "alexa-lg-webos-tv-common";
import {Gateway} from "../gateway-api";

async function stateHandler(alexaResponse: AlexaResponse): Promise<AlexaResponse> {
    try {
        const startTime = new Date();
        const statesList = await Promise.all([
            Promise.resolve(alexa.states()),
            Promise.resolve(alexaEndpointHealth.states()),
            Promise.resolve(alexaPowerController.states()),
            Promise.resolve(alexaRangeController.states())
        ]);
        const endTime = new Date();
        const states = [].concat(...statesList);
        const timeOfSample = endTime.toISOString();
        const uncertaintyInMilliseconds = endTime.getTime() - startTime.getTime();
        states.forEach((contextProperty) => {
            contextProperty.timeOfSample = timeOfSample;
            contextProperty.uncertaintyInMilliseconds = uncertaintyInMilliseconds;
            alexaResponse.addContextProperty(contextProperty);
        });
        return alexaResponse;
    } catch (_error) {
        return alexaResponse;
    }
}

async function remoteResponse(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const gateway = new Gateway("x");
    try {
        const alexaResponse = await gateway.sendSkillDirective(alexaRequest);
        return alexaResponse;
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(event: AlexaRequest, _context: any): Promise<AlexaResponse> {
    try {
        const alexaRequest = new AlexaRequest(event);
        if (!(Reflect.has(alexaRequest.directive, "endpoint") && Reflect.has(alexaRequest.directive.endpoint, "endpointId"))) {
            switch (alexaRequest.directive.header.namespace) {
                case "Alexa.Authorization":
                    return alexaAuthorization.handler(alexaRequest);
                case "Alexa.Discovery":
                    return alexaDiscovery.handler(alexaRequest);
                default:
                    return Promise.resolve(directiveErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
            }
        } else if (alexaRequest.directive.endpoint.endpointId === "lg-webos-tv-gateway") {
            switch (alexaRequest.directive.header.namespace) {
                case "Alexa":
                    return stateHandler(await alexa.handler(alexaRequest));
                case "Alexa.EndpointHealth":
                    return stateHandler(await alexaEndpointHealth.handler(alexaRequest));
                case "Alexa.PowerController":
                    return stateHandler(await alexaPowerController.handler(alexaRequest));
                case "Alexa.RangeController":
                    return stateHandler(await alexaRangeController.handler(alexaRequest));
                default:
                    return Promise.resolve(directiveErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
            }
        } else {
            return remoteResponse(alexaRequest);
        }
    } catch (error) {
        return Promise.resolve(errorToErrorResponse(event, error));
    }
}

async function handlerWithLogging(event: AlexaRequest, context: any): Promise<AlexaResponse> {
    const alexaResponse = await handler(event, context);

    const gateway = new Gateway("x");
    await gateway.sendSkillDirective({"log": event});
    await gateway.sendSkillDirective({"log": alexaResponse});

    return alexaResponse;
}

export {handlerWithLogging as handler};