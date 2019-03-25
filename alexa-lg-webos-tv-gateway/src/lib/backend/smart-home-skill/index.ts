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
import {Backend} from "../../backend";
import {UDN} from "../../common";
// const {alexaSmartHomeMessageSchema} = require("alexa-lg-webos-tv-common");

async function stateHandler(backend: Backend, alexaResponse: AlexaResponse): Promise<AlexaResponse> {
    try {
        const udn: UDN = alexaResponse.event.endpoint.endpointId;
        const startTime: Date = new Date();
        const statesList = await Promise.all([
            alexa.states(backend, udn),
            alexaPowerController.states(backend, udn),
            alexaSpeaker.states(backend, udn),
            alexaChannelController.states(backend, udn),
            alexaInputController.states(backend, udn),
            alexaLauncher.states(backend, udn),
            alexaPlaybackController.states(backend, udn)
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
async function handler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const response = await handlerWithoutValidation(backend, alexaRequest);
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

async function handlerWithoutValidation(backend: Backend, event: any): Promise<AlexaResponse> {
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
                return alexaAuthorization.handler(backend, alexaRequest);
            case "Alexa.Discovery":
                return alexaDiscovery.handler(backend, alexaRequest);
            case "Alexa":
                return stateHandler(backend, await alexa.handler(backend, alexaRequest));
            case "Alexa.PowerController":
                return stateHandler(backend, await alexaPowerController.handler(backend, alexaRequest));
            case "Alexa.Speaker":
                return stateHandler(backend, await alexaSpeaker.handler(backend, alexaRequest));
            case "Alexa.ChannelController":
                return stateHandler(backend, await alexaChannelController.handler(backend, alexaRequest));
            case "Alexa.InputController":
                return stateHandler(backend, await alexaInputController.handler(backend, alexaRequest));
            case "Alexa.Launcher":
                return stateHandler(backend, await alexaLauncher.handler(backend, alexaRequest));
            case "Alexa.PlaybackController":
                return stateHandler(backend, await alexaPlaybackController.handler(backend, alexaRequest));
            default:
                return unknownNamespaceError();
        }
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }
}

export {handlerWithoutValidation as handler};