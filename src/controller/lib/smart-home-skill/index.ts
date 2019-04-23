import * as AWSLambda from "aws-lambda";
import * as alexa from "./alexa";
import * as alexaAuthorization from "./authorization";
import * as alexaDiscovery from "./discovery";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    errorToErrorResponse} from "../../../common";
import {Gateway} from "../gateway-api";

function capabilities(): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        ...alexa.capabilities(),
        ...alexaEndpointHealth.capabilities(),
        ...alexaPowerController.capabilities(),
        ...alexaRangeController.capabilities()
    ];
}

function states(): Promise<AlexaResponseContextProperty>[] {
    return [
        ...alexa.states(),
        ...alexaEndpointHealth.states(),
        ...alexaPowerController.states(),
        ...alexaRangeController.states()
    ];
}

async function stateHandler(alexaResponse: AlexaResponse): Promise<AlexaResponse> {
    try {
        (await Promise.all(states())).forEach((state): void => {
            if (typeof state === "undefined" || state === null ||
                typeof state.value === "undefined" || state.value === null) {
                return;
            }
            alexaResponse.addContextProperty(state);
        });
        return alexaResponse;
    } catch (error) {
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
async function handler(event: AlexaRequest, context: AWSLambda.Context): Promise<AlexaResponse> {
    try {
        const alexaRequest = new AlexaRequest(event);
        if (typeof alexaRequest.directive.endpoint === "undefined" ||
            typeof alexaRequest.directive.endpoint.endpointId === "undefined") {
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

async function handlerWithLogging(alexaRequest: AlexaRequest, context: AWSLambda.Context): Promise<AlexaResponse> {
    const gateway = new Gateway("x");
    try {
        await gateway.send({"path": Gateway.skillPath()}, {"log": alexaRequest});
    } catch (error) {
        //
    }

    let alexaResponse: AlexaResponse | null = null;
    try {
        alexaResponse = await handler(alexaRequest, context);
    } catch (error) {
        alexaResponse = errorToErrorResponse(alexaRequest, error);
    }

    try {
        await gateway.send({"path": Gateway.skillPath()}, {"log": alexaResponse});
    } catch (error) {
        //
    }

    return alexaResponse;
}

export class SmartHomeSkill {
    // eslint-disable-next-line class-methods-use-this
    public async handler(event: AlexaRequest, context: AWSLambda.Context, callback: (error: Error | null, response?: AlexaResponse) => void): Promise<void> {
        try {
            const response = await handlerWithLogging(event, context);
            callback(null, response);
            return;
        } catch (error) {
            callback(error);
            // eslint-disable-next-line no-useless-return
            return;
        }
    }
}

export {capabilities, states, handlerWithLogging as handler};