import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    GenericError,
    LGTVRequest,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "../../../../common";
import {Backend} from "../../backend";
import {UDN} from "../../tv";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_backend: Backend, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapability[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.Speaker",
            "version": "3",
            "properties": {
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
        }
    ];
}

async function states(backend: Backend, udn: UDN): Promise<AlexaResponseContextProperty[]> {
    if (backend.getPowerState(udn) === "OFF") {
        return [];
    }

    const command = {
        "uri": "ssap://audio/getVolume"
    };
    try {
        const lgtvResponse = await backend.lgtvCommand(udn, command);
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

async function setVolumeHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    function getVolume(): number {
        const {volume} = alexaRequest.directive.payload;
        if ((volume < 0) || (volume > 100)) {
            throw new GenericError(
                "VALUE_OUT_OF_RANGE",
                "volume must be between 0 and 100 inclusive."
            );
        }
        return volume;
    }

    async function setVolume(volume: number): Promise<AlexaResponse> {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
        const command: LGTVRequest = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await backend.lgtvCommand(udn, command);
        return new AlexaResponse({
            "namespace": "Alexa",
            "name": "Response",
            "correlationToken": alexaRequest.getCorrelationToken(),
            "endpointId": alexaRequest.getEndpointId()
        });
    }

    let lgtvVolume: number = -1;
    try {
        lgtvVolume = await getVolume();
    } catch (error) {
        return Promise.resolve(errorResponse(
            alexaRequest,
            error.name,
            error.message
        ));
    }
    return setVolume(lgtvVolume);
}

async function adjustVolumeHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    async function getVolume(): Promise<number> {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);

        const command = {
            "uri": "ssap://audio/getVolume"
        };
        const lgtvResponse = await backend.lgtvCommand(udn, command);
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
        await backend.lgtvCommand(udn, command);
        return new AlexaResponse({
            "namespace": "Alexa",
            "name": "Response",
            "correlationToken": alexaRequest.getCorrelationToken(),
            "endpointId": alexaRequest.getEndpointId()
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

function setMuteHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    async function setMute(): Promise<AlexaResponse> {
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
        const command = {
            "uri": "ssap://audio/setMute",
            "payload": {"mute": alexaRequest.directive.payload.mute}
        };
        await backend.lgtvCommand(udn, command);
        const alexaResponse = new AlexaResponse({
            "namespace": "Alexa",
            "name": "Response",
            "correlationToken": alexaRequest.getCorrelationToken(),
            "endpointId": alexaRequest.getEndpointId()
        });

        return alexaResponse;
    }

    return setMute();
}

function handler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Speaker") {
        namespaceErrorResponse(alexaRequest, "Alexa.Speaker");
    }
    switch (alexaRequest.directive.header.name) {
        case "SetVolume":
            return setVolumeHandler(backend, alexaRequest);
        case "AdjustVolume":
            return adjustVolumeHandler(backend, alexaRequest);
        case "SetMute":
            return setMuteHandler(backend, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.Speaker"));
    }
}

export {capabilities, states, handler};