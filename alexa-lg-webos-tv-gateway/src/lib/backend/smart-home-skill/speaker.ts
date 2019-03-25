import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextPropertyInput,
    AlexaResponseEventPayloadEndpointCapabilityInput,
    GenericError,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "../../backend";
import {UDN} from "../../common";
// eslint-disable-next-line no-unused-vars
function capabilities(_backendController: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.Speaker",
            "version": "3",
            "supported": [
                {
                    "name": "volume"
                },
                {
                    "name": "muted"
                }
            ],
            "proactivelyReported": false,
            "retrievable": true
        }
    ];
}

async function states(backendController: BackendController, udn: UDN): Promise<AlexaResponseContextPropertyInput[]> {
    if (backendController.getPowerState(udn) === "OFF") {
        return [];
    }

    const command = {
        "uri": "ssap://audio/getVolume"
    };
    try {
        const lgtvResponse = await backendController.lgtvCommand(udn, command);
        const volumeState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "volume",
            "value": lgtvResponse.volume
        });
        const mutedState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "muted",
            "value": lgtvResponse.muted
        });
        return [
            volumeState,
            mutedState
        ];
    } catch (error) {
        return [];
    }
}

async function setVolumeHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    function getVolume() {
        const {volume} = alexaRequest.directive.payload;
        if ((volume < 0) || (volume > 100)) {
            return errorResponse(
                alexaRequest,
                "VALUE_OUT_OF_RANGE",
                "volume must be between 0 and 100 inclusive."
            );
        }
        return volume;
    }

    async function setVolume(volume: number) {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
        const command = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await backendController.lgtvCommand(udn, command);
        return new AlexaResponse({
            "request": alexaRequest,
            "namespace": "Alexa",
            "name": "Response"
        });
    }

    let lgtvVolume: number = -1;
    try {
        lgtvVolume = await getVolume();
    } catch (error) {
        return Promise.resolve(errorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            error.name
        ));
    }
    return setVolume(lgtvVolume);
}

async function adjustVolumeHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    async function getVolume(): Promise<number> {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);

        const command = {
            "uri": "ssap://audio/getVolume"
        };
        const lgtvResponse = await backendController.lgtvCommand(udn, command);
        if (Reflect.has(lgtvResponse, "volume") === false) {
            throw new GenericError("error", "The T.V. did not return it's volume.");
        }
        let {volume} = lgtvResponse;
        if (alexaRequest.directive.payload.volumeDefault === true) {
            if (alexaRequest.directive.payload.volume < 0) {
                volume -= 3;
            } else if (alexaRequest.directive.payload.volume > 0) {
                volume += 3;
            }
        } else {
            volume += alexaRequest.directive.payload.volume;
        }
        if (volume < 0) {
            volume = 0;
        }
        if (volume > 100) {
            volume = 100;
        }
        return volume;
    }

    async function setVolume(volume: number): Promise<AlexaResponse> {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
        const command = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await backendController.lgtvCommand(udn, command);
        return new AlexaResponse({
            "request": alexaRequest,
            "namespace": "Alexa",
            "name": "Response"
        });
    }

    let lgtvVolume: number = -1;
    try {
        lgtvVolume = await getVolume();
    } catch (error) {
        return Promise.resolve(errorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            error.name
        ));
    }
    return setVolume(lgtvVolume);
}

function setMuteHandler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    async function setMute(): Promise<AlexaResponse> {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
        const command = {
            "uri": "ssap://audio/setMute",
            "payload": {"mute": alexaRequest.directive.payload.mute}
        };
        await backendController.lgtvCommand(udn, command);
        const alexaResponse = new AlexaResponse({
            "request": alexaRequest,
            "namespace": "Alexa",
            "name": "Response"
        });

        return alexaResponse;
    }

    return setMute();
}

function handler(backendController: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Speaker") {
        namespaceErrorResponse(alexaRequest, "Alexa.Speaker");
    }
    switch (alexaRequest.directive.header.name) {
        case "SetVolume":
            return setVolumeHandler(backendController, alexaRequest);
        case "AdjustVolume":
            return adjustVolumeHandler(backendController, alexaRequest);
        case "SetMute":
            return setMuteHandler(backendController, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.Speaker"));
    }
}

export {capabilities, states, handler};