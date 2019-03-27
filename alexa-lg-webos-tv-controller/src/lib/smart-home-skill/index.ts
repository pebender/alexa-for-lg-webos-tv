import * as alexa from "./alexa";
import * as alexaAuthorization from "./authorization";
import * as alexaDiscovery from "./discovery";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {AlexaResponse,
    directiveErrorResponse,
    errorToErrorResponse} from "alexa-lg-webos-tv-common";
import {Gateway} from "../gateway-api";

async function handlerWithLogging(event, context): Promise<any> {
    const response = await handler(event, context);

    const gateway = new Gateway("x");
    const logRequest = {
        "log": event
    };
    const logResponse = {
        "log": response
    };
    await gateway.sendSkillDirective(logRequest);
    await gateway.sendSkillDirective(logResponse);
    return response;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(event, _context): Promise<any> {
    try {
        if (!(Reflect.has(event.directive, "endpoint") && Reflect.has(event.directive.endpoint, "endpointId"))) {
            switch (event.directive.header.namespace) {
                case "Alexa.Authorization":
                    return alexaAuthorization.handler(event);
                case "Alexa.Discovery":
                    return alexaDiscovery.handler(event);
                default:
                    return Promise.resolve(directiveErrorResponse(event, event.directive.header.namespace));
            }
        } else if (event.directive.endpoint.endpointId === "lg-webos-tv-gateway") {
            switch (event.directive.header.namespace) {
                case "Alexa":
                    return stateHandler(alexa.handler(event));
                case "Alexa.EndpointHealth":
                    return stateHandler(alexaEndpointHealth.handler(event));
                case "Alexa.PowerController":
                    return stateHandler(alexaPowerController.handler(event));
                case "Alexa.RangeController":
                    return stateHandler(alexaRangeController.handler(event));
                default:
                    return Promise.resolve(directiveErrorResponse(event, event.directive.header.namespace));
            }
        } else {
            return remoteResponse(event);
        }
    } catch (error) {
        return Promise.resolve(errorToErrorResponse(error, event));
    }
}

async function remoteResponse(event): Promise<any> {
    const gateway = new Gateway("x");
    try {
        const response = await gateway.sendSkillDirective(event);
        return response;
    } catch (error) {
        return errorToErrorResponse(error, event);
    }
}

async function stateHandler(response): Promise<any> {
    const alexaResponse = new AlexaResponse(response);
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

export {handlerWithLogging as handler};