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
    AlexaResponseContextProperty,
    errorResponse,
    errorToErrorResponse} from "../../../../common";
import {Backend} from "../../backend";
import {UDN} from "../../tv";

async function stateHandler(backend: Backend, alexaRequest: AlexaRequest, alexaResponse: AlexaResponse): Promise<AlexaResponse> {
    try {
        const udn: UDN = (alexaRequest.getEndpointId() as UDN);
        const states: AlexaResponseContextProperty[] = await Promise.all([
            ...alexa.states(backend, udn),
            ...alexaPowerController.states(backend, udn),
            ...alexaSpeaker.states(backend, udn),
            ...alexaChannelController.states(backend, udn),
            ...alexaInputController.states(backend, udn),
            ...alexaLauncher.states(backend, udn),
            ...alexaPlaybackController.states(backend, udn)
        ]);
        states.forEach((state) => {
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

async function handlerWithoutValidation(backend: Backend, event: AlexaRequest): Promise<AlexaResponse> {
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

    try {
        switch (alexaRequest.directive.header.namespace) {
            case "Alexa.Authorization":
                return alexaAuthorization.handler(backend, alexaRequest);
            case "Alexa.Discovery":
                return alexaDiscovery.handler(backend, alexaRequest);
            case "Alexa":
                return stateHandler(backend, alexaRequest, await alexa.handler(backend, alexaRequest));
            case "Alexa.PowerController":
                return stateHandler(backend, alexaRequest, await alexaPowerController.handler(backend, alexaRequest));
            case "Alexa.Speaker":
                return stateHandler(backend, alexaRequest, await alexaSpeaker.handler(backend, alexaRequest));
            case "Alexa.ChannelController":
                return stateHandler(backend, alexaRequest, await alexaChannelController.handler(backend, alexaRequest));
            case "Alexa.InputController":
                return stateHandler(backend, alexaRequest, await alexaInputController.handler(backend, alexaRequest));
            case "Alexa.Launcher":
                return stateHandler(backend, alexaRequest, await alexaLauncher.handler(backend, alexaRequest));
            case "Alexa.PlaybackController":
                return stateHandler(backend, alexaRequest, await alexaPlaybackController.handler(backend, alexaRequest));
            default:
                return errorResponse(
                    alexaRequest,
                    "INTERNAL_ERROR",
                    `Unknown namespace ${alexaRequest.directive.header.namespace}`
                );
        }
    } catch (error) {
        return errorToErrorResponse(alexaRequest, error);
    }
}

export {handlerWithoutValidation as handler};