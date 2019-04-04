import * as alexa from "./alexa";
import * as alexaAuthorization from "./authorization";
import * as alexaDiscovery from "./discovery";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {AlexaRequest,
    AlexaResponse,
    directiveErrorResponse,
    errorToErrorResponse} from "../../../common";
import {Gateway} from "../gateway-api";

async function stateHandler(alexaResponse: AlexaResponse): Promise<AlexaResponse> {
    try {
        const states = await Promise.all([
            ...alexa.states(),
            ...alexaEndpointHealth.states(),
            ...alexaPowerController.states(),
            ...alexaRangeController.states()
        ]);
        states.forEach((state) => {
            if (typeof state === "undefined" || typeof state.value === "undefined" || state.value === null) {
                return;
            }
            alexaResponse.addContextProperty(state);
        });
        return alexaResponse;
    } catch (_error) {
        return alexaResponse;
    }
}

async function remoteResponse(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const gateway = new Gateway("");
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

async function handlerWithLogging(alexaRequest: AlexaRequest, context: any): Promise<AlexaResponse> {
    const gateway = new Gateway("x");
    try {
        await gateway.send({"path": Gateway.skillPath()}, {"log": alexaRequest});
    } catch (error) {
        //
    }

    let response: any = null;
    try {
        response = await handler(alexaRequest, context);
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }

    let alexaResponse: AlexaResponse = null;
    try {
        alexaResponse = new AlexaResponse(response);
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }

    try {
        await gateway.send({"path": Gateway.skillPath()}, {"log": alexaResponse});
    } catch (error) {
        //
    }

    return alexaResponse;
}

export {handlerWithLogging as handler};