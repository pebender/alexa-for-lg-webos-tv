import * as ASH from "../../../common/alexa";
import * as AWSLambda from "aws-lambda";
import * as alexa from "./alexa";
import * as alexaAuthorization from "./authorization";
import * as alexaDiscovery from "./discovery";
import * as alexaEndpointHealth from "./endpoint-health";
import * as alexaPowerController from "./power-controller";
import * as alexaRangeController from "./range-controller";
import {Gateway} from "../gateway-api";

function capabilities(): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
    return [
        ...alexa.capabilities(),
        ...alexaEndpointHealth.capabilities(),
        ...alexaPowerController.capabilities(),
        ...alexaRangeController.capabilities()
    ];
}

function states(): Promise<ASH.ResponseContextProperty>[] {
    return [
        ...alexa.states(),
        ...alexaEndpointHealth.states(),
        ...alexaPowerController.states(),
        ...alexaRangeController.states()
    ];
}

async function stateHandler(alexaResponse: ASH.Response): Promise<ASH.Response> {
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

async function remoteResponse(alexaRequest: ASH.Request): Promise<ASH.Response> {
    const gateway = new Gateway("");
    try {
        const alexaResponse = await gateway.sendSkillDirective(alexaRequest);
        return alexaResponse;
    } catch (error) {
        return ASH.errorResponseFromError(alexaRequest, error);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(event: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
    try {
        const alexaRequest = new ASH.Request(event);
        if (typeof alexaRequest.directive.endpoint === "undefined" ||
            typeof alexaRequest.directive.endpoint.endpointId === "undefined") {
            switch (alexaRequest.directive.header.namespace) {
            case "Alexa.Authorization":
                return alexaAuthorization.handler(alexaRequest);
            case "Alexa.Discovery":
                return alexaDiscovery.handler(alexaRequest);
            default:
                return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
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
                return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
            }
        } else {
            return remoteResponse(alexaRequest);
        }
    } catch (error) {
        return Promise.resolve(ASH.errorResponseFromError(event, error));
    }
}

async function handlerWithLogging(alexaRequest: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
    const gateway = new Gateway("x");
    try {
        await gateway.send({"path": Gateway.skillPath()}, {"log": alexaRequest});
    } catch (error) {
        //
    }

    let alexaResponse: ASH.Response | null = null;
    try {
        alexaResponse = await handler(alexaRequest, context);
    } catch (error) {
        alexaResponse = ASH.errorResponseFromError(alexaRequest, error);
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
    public async handler(event: ASH.Request, context: AWSLambda.Context, callback: (error: Error | null, response?: ASH.Response) => void): Promise<void> {
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