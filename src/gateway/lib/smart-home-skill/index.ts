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
    AlexaResponseEventPayloadEndpointCapability,
    errorResponse,
    errorToErrorResponse} from "../../../common";
import {Backend,
    BackendControl} from "../backend";

function capabilities(backendControl: BackendControl): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        ...alexa.capabilities(backendControl),
        ...alexaPowerController.capabilities(backendControl),
        ...alexaSpeaker.capabilities(backendControl),
        ...alexaChannelController.capabilities(backendControl),
        ...alexaInputController.capabilities(backendControl),
        ...alexaLauncher.capabilities(backendControl),
        ...alexaPlaybackController.capabilities(backendControl)
    ];
}

function states(backendControl: BackendControl): Promise<AlexaResponseContextProperty>[] {
    return [
        ...alexa.states(backendControl),
        ...alexaPowerController.states(backendControl),
        ...alexaSpeaker.states(backendControl),
        ...alexaChannelController.states(backendControl),
        ...alexaInputController.states(backendControl),
        ...alexaLauncher.states(backendControl),
        ...alexaPlaybackController.states(backendControl)
    ];
}

async function addStates(alexaResponse: AlexaResponse, backendControl: BackendControl): Promise<AlexaResponse> {
    try {
        (await Promise.all(states(backendControl))).forEach((state): void => {
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

async function handlerWithoutValidation(event: AlexaRequest, backend: Backend): Promise<AlexaResponse> {
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
        const udn = alexaRequest.getEndpointId();
        if (typeof udn === "undefined") {
            switch (alexaRequest.directive.header.namespace) {
                case "Alexa.Authorization":
                    return alexaAuthorization.handler(alexaRequest, backend);
                case "Alexa.Discovery":
                    return alexaDiscovery.handler(alexaRequest, backend);
                default:
                    return errorResponse(
                        alexaRequest,
                        "INTERNAL_ERROR",
                        `Unknown namespace ${alexaRequest.directive.header.namespace}`
                    );
            }
        }
        const backendControl = backend.control(udn);
        if (typeof backendControl === "undefined") {
            return errorResponse(
                alexaRequest,
                "INTERNAL_ERROR",
                `unknown LGTV UDN ${udn}`
            );
        }
        switch (alexaRequest.directive.header.namespace) {
            case "Alexa":
                return addStates(await alexa.handler(alexaRequest, backendControl), backendControl);
            case "Alexa.PowerController":
                return addStates(await alexaPowerController.handler(alexaRequest, backendControl), backendControl);
            case "Alexa.Speaker":
                return addStates(await alexaSpeaker.handler(alexaRequest, backendControl), backendControl);
            case "Alexa.ChannelController":
                return addStates(await alexaChannelController.handler(alexaRequest, backendControl), backendControl);
            case "Alexa.InputController":
                return addStates(await alexaInputController.handler(alexaRequest, backendControl), backendControl);
            case "Alexa.Launcher":
                return addStates(await alexaLauncher.handler(alexaRequest, backendControl), backendControl);
            case "Alexa.PlaybackController":
                return addStates(await alexaPlaybackController.handler(alexaRequest, backendControl), backendControl);
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

export class SmartHomeSkill {
    private backend: Backend;
    public constructor(backend: Backend) {
        this.backend = backend;
    }

    public handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
        return handlerWithoutValidation(alexaRequest, this.backend);
    }
}

export {capabilities, states, handlerWithoutValidation as handler};