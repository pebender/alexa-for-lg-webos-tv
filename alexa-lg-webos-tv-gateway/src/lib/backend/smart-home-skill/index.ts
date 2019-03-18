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
async function handler(lgtv: BackendController, event: AlexaRequest): Promise<AlexaResponse> {
    const response = await handlerWithoutValidation(lgtv, event);
    const ajv = new Ajv({"allErrors": true});
    const validateSchemaFunction = await ajv.compile(alexaSmartHomeMessageSchema);
    const valid = await validateSchemaFunction(response);
    if (valid === true) {
        return response;
    }
    const schemaErrors = JSON.stringify(validateSchemaFunction.errors, null, 2);
    return errorResponse(
        event,
        "INTERNAL_ERROR",
        `The generated response message was invalid. Schema errors: ${schemaErrors}.`
    );
}
*/

async function handlerWithoutValidation(lgtv: BackendController, event: AlexaRequest): Promise<AlexaResponse> {
    if (!Reflect.has(event, "directive")) {
        return missingKeyError("directive");
    }
    if (!Reflect.has(event.directive, "header")) {
        return missingKeyError("directive.header");
    }
    if (!Reflect.has(event.directive.header, "payloadVersion")) {
        return missingKeyError("directive.header.payloadVersion");
    }
    if (!(event.directive.header.payloadVersion === "3")) {
        return errorResponse(
            event,
            "INTERNAL_ERROR",
            "This skill only supports Smart Home API version three."
        );
    }
    if (!Reflect.has(event.directive.header, "namespace")) {
        return missingKeyError("directive.header.namespace");
    }
    if (!Reflect.has(event.directive.header, "name")) {
        return missingKeyError("directive.header.name");
    }

    try {
        switch (event.directive.header.namespace) {
            case "Alexa.Authorization":
                return alexaAuthorization.handler(lgtv, event);
            case "Alexa.Discovery":
                return alexaDiscovery.handler(lgtv, event);
            case "Alexa":
                return stateHandler(await alexa.handler(lgtv, event));
            case "Alexa.PowerController":
                return stateHandler(await alexaPowerController.handler(lgtv, event));
            case "Alexa.Speaker":
                return stateHandler(await alexaSpeaker.handler(lgtv, event));
            case "Alexa.ChannelController":
                return stateHandler(await alexaChannelController.handler(lgtv, event));
            case "Alexa.InputController":
                return stateHandler(await alexaInputController.handler(lgtv, event));
            case "Alexa.Launcher":
                return stateHandler(await alexaLauncher.handler(lgtv, event));
            case "Alexa.PlaybackController":
                return stateHandler(await alexaPlaybackController.handler(lgtv, event));
            default:
                return unknownNamespaceError();
        }
    } catch (error) {
        return errorToErrorResponse(event, error);
    }

    async function stateHandler(response: AlexaResponse): Promise<AlexaResponse> {
        const alexaResponse = new AlexaResponse(response);
        try {
            const udn: UDN = event.directive.endpoint.endpointId;
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
                    namespace?: string,
                    name?: string,
                    instance?: string,
                    value?: string,
                    timeOfSample?: string,
                    uncertaintyInMilliseconds?: number
            }) => {
                contextProperty.timeOfSample = timeOfSample;
                contextProperty.uncertaintyInMilliseconds = uncertaintyInMilliseconds;
                alexaResponse.addContextProperty(contextProperty);
            });
            return alexaResponse.get();
        } catch (error) {
            return alexaResponse.get();
        }
    }

    function unknownNamespaceError(): AlexaResponse {
        return errorResponse(
            event,
            "INTERNAL_ERROR",
            `Unknown namespace ${event.directive.header.namespace}`
        );
    }

    function missingKeyError(key: string): AlexaResponse {
        return errorResponse(
            event,
            "INVALID_DIRECTIVE",
            `Missing key: ${key}.`
        );
    }
}

export {handlerWithoutValidation as handler};