import * as alexa from "./alexa";
import * as alexaAuthorization from "./authorization";
import * as alexaChannelController from "./channel-controller";
import * as alexaDiscovery from "./discovery";
import * as alexaInputController from "./input-controller";
import * as alexaLauncher from "./launcher";
import * as alexaPlaybackController from "./playback-controller";
import * as alexaPowerController from "./power-controller";
import * as alexaSpeaker from "./speaker";
import {AlexaRequest,
    AlexaResponse,
    errorResponse,
    errorToErrorResponse} from "alexa-lg-webos-tv-common";
// import Ajv from "ajv";
import {BackendController} from "../../backend";
import {UDN} from "../../common";
// const {alexaSmartHomeMessageSchema} = require("alexa-lg-webos-tv-common");

async function stateHandler(backendController: BackendController, alexaResponse: AlexaResponse): Promise<AlexaResponse> {
    try {
        const udn: UDN = alexaResponse.event.endpoint.endpointId;
        const startTime: Date = new Date();
        const statesList = await Promise.all([
            alexa.states(backendController, udn),
            alexaPowerController.states(backendController, udn),
            alexaSpeaker.states(backendController, udn),
            alexaChannelController.states(backendController, udn),
            alexaInputController.states(backendController, udn),
            alexaLauncher.states(backendController, udn),
            alexaPlaybackController.states(backendController, udn)
        ].map((value) => Promise.resolve(value)));
        const endTime = new Date();
        const states = [].concat(...statesList);
        const timeOfSample = endTime.toISOString();
        const uncertaintyInMilliseconds = endTime.getTime() - startTime.getTime();
        states.forEach((contextProperty: {
            namespace: string;
            name: string;
            instance: string;
            value: any;
            timeOfSample: string;
            uncertaintyInMilliseconds: number;
        }) => {
            contextProperty.timeOfSample = timeOfSample;
            contextProperty.uncertaintyInMilliseconds = uncertaintyInMilliseconds;
            alexaResponse.addContextProperty(contextProperty);
        });
        return alexaResponse;
    } catch (error) {
        return alexaResponse;
    }
}

/*
 * We skip the validation function as the schema file does not support
 * Alexa.Launch or Alexa.PlaybackController.
 */
/*
// eslint-disable-next-line no-unused-vars
async function handler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const response = await handlerWithoutValidation(backendController, alexaRequest);
    const ajv = new Ajv({"allErrors": true});
    const validateSchemaFunction = await ajv.compile(alexaSmartHomeMessageSchema);
    const valid = await validateSchemaFunction(response);
    if (valid === true) {
        return response;
    }
    const schemaErrors = JSON.stringify(validateSchemaFunction.errors, null, 2);
    return errorResponse(
        alexaRequest,
        "INTERNAL_ERROR",
        `The generated response message was invalid. Schema errors: ${schemaErrors}.`
    );
}
*/

async function handlerWithoutValidation(backendController: BackendController, event: any): Promise<AlexaResponse> {
    let alexaRequest: AlexaRequest | null = null;
    try {
        alexaRequest = new AlexaRequest(event);
    } catch (error) {
        return new AlexaResponse({
            "namespace": "Alexa",
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": `${error.name}: ${error.message}`
            }
        });
    }

    function unknownNamespaceError(): AlexaResponse {
        return errorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            `Unknown namespace ${alexaRequest.directive.header.namespace}`
        );
    }

    try {
        switch (alexaRequest.directive.header.namespace) {
            case "Alexa.Authorization":
                return alexaAuthorization.handler(backendController, alexaRequest);
            case "Alexa.Discovery":
                return alexaDiscovery.handler(backendController, alexaRequest);
            case "Alexa":
                return stateHandler(backendController, await alexa.handler(backendController, alexaRequest));
            case "Alexa.PowerController":
                return stateHandler(backendController, await alexaPowerController.handler(backendController, alexaRequest));
            case "Alexa.Speaker":
                return stateHandler(backendController, await alexaSpeaker.handler(backendController, alexaRequest));
            case "Alexa.ChannelController":
                return stateHandler(backendController, await alexaChannelController.handler(backendController, alexaRequest));
            case "Alexa.InputController":
                return stateHandler(backendController, await alexaInputController.handler(backendController, alexaRequest));
            case "Alexa.Launcher":
                return stateHandler(backendController, await alexaLauncher.handler(backendController, alexaRequest));
            case "Alexa.PlaybackController":
                return stateHandler(backendController, await alexaPlaybackController.handler(backendController, alexaRequest));
            default:
                return unknownNamespaceError();
        }
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }
}

export {handlerWithoutValidation as handler};