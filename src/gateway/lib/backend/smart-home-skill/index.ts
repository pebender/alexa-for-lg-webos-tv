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

async function stateHandler(backend: Backend, alexaResponse: AlexaResponse): Promise<AlexaResponse> {
    try {
        const udn: UDN = alexaResponse.event.endpoint.endpointId;
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
            if (typeof state === "undefined" || typeof state.value === "undefined" || state.value === null) {
                return;
            }
            alexaResponse.addContextProperty(state);
        });
        return alexaResponse;
    } catch (error) {
        return alexaResponse;
    }
}

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