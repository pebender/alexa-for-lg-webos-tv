import {AlexaRequest, AlexaResponse} from "alexa-lg-webos-tv-common";
import {errorToErrorResponse, errorResponse} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";
const alexaAuthorization = require("./authorization");
const alexaDiscovery = require("./discovery");
const alexa = require("./alexa");
const alexaPowerController = require("./power-controller");
const alexaSpeaker = require("./speaker");
const alexaChannelController = require("./channel-controller");
const alexaInputController = require("./input-controller");
const alexaLauncher = require("./launcher");
const alexaPlaybackController = require("./playback-controller");
// import Ajv from "ajv";
// const {alexaSmartHomeMessageSchema} = require("alexa-lg-webos-tv-common");


/*
 * We skip the validation function as the schema file does not support
 * Alexa.Launch or Alexa.PlaybackController.
 */
/*
// eslint-disable-next-line no-unused-vars
async function handler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const response = await handlerWithoutValidation(lgtv, alexaRequest);
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

async function handlerWithoutValidation(lgtv: BackendController, event: any): Promise<AlexaResponse> {
    let alexaRequest: AlexaRequest;
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

    try {
        switch (alexaRequest.directive.header.namespace) {
            case "Alexa.Authorization":
                return alexaAuthorization.handler(lgtv, alexaRequest);
            case "Alexa.Discovery":
                return alexaDiscovery.handler(lgtv, alexaRequest);
            case "Alexa":
                return stateHandler(await alexa.handler(lgtv, alexaRequest));
            case "Alexa.PowerController":
                return stateHandler(await alexaPowerController.handler(lgtv, alexaRequest));
            case "Alexa.Speaker":
                return stateHandler(await alexaSpeaker.handler(lgtv, alexaRequest));
            case "Alexa.ChannelController":
                return stateHandler(await alexaChannelController.handler(lgtv, alexaRequest));
            case "Alexa.InputController":
                return stateHandler(await alexaInputController.handler(lgtv, alexaRequest));
            case "Alexa.Launcher":
                return stateHandler(await alexaLauncher.handler(lgtv, alexaRequest));
            case "Alexa.PlaybackController":
                return stateHandler(await alexaPlaybackController.handler(lgtv, alexaRequest));
            default:
                return unknownNamespaceError();
        }
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }

    async function stateHandler(alexaResponse: AlexaResponse): Promise<AlexaResponse> {
        try {
            const udn: UDN = alexaRequest.directive.endpoint.endpointId;
            const startTime: Date = new Date();
            const statesList = await Promise.all([
                alexa.states(lgtv, udn),
                alexaPowerController.states(lgtv, udn),
                alexaSpeaker.states(lgtv, udn),
                alexaChannelController.states(lgtv, udn),
                alexaInputController.states(lgtv, udn),
                alexaLauncher.states(lgtv, udn),
                alexaPlaybackController.states(lgtv, udn)
            ].map((value) => Promise.resolve(value)));
            const endTime = new Date();
            const states = [].concat(...statesList);
            const timeOfSample = endTime.toISOString();
            const uncertaintyInMilliseconds = endTime.getTime() - startTime.getTime();
            states.forEach((contextProperty: {
                    namespace: string,
                    name: string,
                    instance: string,
                    value: any,
                    timeOfSample: string,
                    uncertaintyInMilliseconds: number
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

    function unknownNamespaceError(): AlexaResponse {
        return errorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            `Unknown namespace ${alexaRequest.directive.header.namespace}`
        );
    }
}

export {handlerWithoutValidation as handler};