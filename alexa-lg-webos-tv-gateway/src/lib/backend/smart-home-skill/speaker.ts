import {directiveErrorResponse, namespaceErrorResponse, errorResponse, GenericError} from "alexa-lg-webos-tv-common";
import {AlexaRequest, AlexaResponse, AlexaResponseEventPayloadEndpointCapabilityInput, AlexaResponseContextPropertyInput} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";
// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapabilityInput[] {
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

async function states(lgtv: BackendController, udn: UDN): Promise<AlexaResponseContextPropertyInput[]> {
    if (lgtv.getPowerState(udn) === "OFF") {
        return [];
    }

    const command = {
        "uri": "ssap://audio/getVolume"
    };
    try {
        const lgtvResponse = await lgtv.lgtvCommand(udn, command);
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

function handler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Speaker") {
        namespaceErrorResponse(alexaRequest, "Alexa.Speaker");
    }
    switch (alexaRequest.directive.header.name) {
        case "SetVolume":
            return setVolumeHandler(lgtv, alexaRequest);
        case "AdjustVolume":
            return adjustVolumeHandler(lgtv, alexaRequest);
        case "SetMute":
            return setMuteHandler(lgtv, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.Speaker"));
    }
}

async function setVolumeHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    let lgtvVolume: number;
    try {
        lgtvVolume = await getVolume()
    } catch (error) {
        return Promise.resolve(errorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            error.name
        ));
    }
    return setVolume(lgtvVolume);

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
        const {endpointId} = alexaRequest.directive.endpoint;
        const command = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await lgtv.lgtvCommand(endpointId, command);
        return new AlexaResponse({
            "request": alexaRequest,
            "namespace": "Alexa",
            "name": "Response"
        });
    }
}

async function adjustVolumeHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    let lgtvVolume: number;
    try {
        lgtvVolume = await getVolume()
    } catch (error) {
        return Promise.resolve(errorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            error.name
        ));
    }
    return setVolume(lgtvVolume);

    async function getVolume(): Promise<number> {
        const {endpointId} = alexaRequest.directive.endpoint;

        const command = {
            "uri": "ssap://audio/getVolume"
        };
        const lgtvResponse = await lgtv.lgtvCommand(endpointId, command);
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
        const {endpointId} = alexaRequest.directive.endpoint;
        const command = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await lgtv.lgtvCommand(endpointId, command);
        return new AlexaResponse({
            "request": alexaRequest,
            "namespace": "Alexa",
            "name": "Response"
        });
    }
}

function setMuteHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return setMute();

    async function setMute(): Promise<AlexaResponse> {
        const {endpointId} = alexaRequest.directive.endpoint;
        const command = {
            "uri": "ssap://audio/setMute",
            "payload": {"mute": alexaRequest.directive.payload.mute}
        };
        await lgtv.lgtvCommand(endpointId, command);
        return new AlexaResponse({
            "request": alexaRequest,
            "namespace": "Alexa",
            "name": "Response"
        });
    }
}

export {capabilities, states, handler};