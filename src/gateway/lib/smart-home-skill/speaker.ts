import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "../../../common";
import {BackendControl} from "../backend";
import LGTV from "lgtv2";    
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backendControl: BackendControl): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        Promise.resolve({
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
        })
    ];
}

function states(backendControl: BackendControl): Promise<AlexaResponseContextProperty>[] {
    function getVolumeState(): Promise<AlexaResponseContextProperty> {
        async function value(): Promise<number> {
            const lgtvRequest: LGTV.Request = {
                "uri": "ssap://audio/getVolume"
            };
            const lgtvResponse: LGTV.ResponseVolume = (await backendControl.lgtvCommand(lgtvRequest) as LGTV.ResponseVolume);
            if (typeof lgtvResponse.volume !== "number") {
                throw new Error("invalid lgtvCommand response");
            }
            return lgtvResponse.volume;
        }

        const volumeState = AlexaResponse.buildContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "volume",
            "value": value
        });
        return volumeState;
    }

    function getMutedState(): Promise<AlexaResponseContextProperty> {
        async function value(): Promise<boolean> {
            const lgtvRequest: LGTV.Request = {
                "uri": "ssap://audio/getVolume"
            };
            const lgtvResponse: LGTV.ResponseVolume = (await backendControl.lgtvCommand(lgtvRequest) as LGTV.ResponseVolume);
            if (typeof lgtvResponse.muted !== "boolean") {
                throw new Error("invalid lgtvCommand response");
            }
            return lgtvResponse.muted;
        }

        const mutedState = AlexaResponse.buildContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "muted",
            "value": value
        });
        return mutedState;
    }

    if (backendControl.getPowerState() === "OFF") {
        return [];
    }

    return [
        getVolumeState(),
        getMutedState()
    ];
}

async function setVolumeHandler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    function getVolume(): number {
        const {volume} = alexaRequest.directive.payload;
        if (typeof volume !== "number" || volume < 0 || volume > 100) {
            throw new RangeError("volume must be between 0 and 100 inclusive");
        }
        return volume;
    }

    async function setVolume(volume: number): Promise<AlexaResponse> {
        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await backendControl.lgtvCommand(lgtvRequest);
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

async function adjustVolumeHandler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    async function getVolume(): Promise<number> {
        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://audio/getVolume"
        };
        const lgtvResponse: LGTV.ResponseVolume = (await backendControl.lgtvCommand(lgtvRequest) as LGTV.ResponseVolume);
        if (typeof lgtvResponse.volume === "undefined") {
            throw new Error("the T.V. did not return it's volume");
        }
        let volume = (lgtvResponse.volume as number);
        if (alexaRequest.directive.payload.volumeDefault === true) {
            if (alexaRequest.directive.payload.volume < 0) {
                volume -= 3;
            } else if (alexaRequest.directive.payload.volume > 0) {
                volume += 3;
            }
        } else {
            volume += (alexaRequest.directive.payload.volume as number);
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
        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await backendControl.lgtvCommand(lgtvRequest);
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
            error.message
        ));
    }
    return setVolume(lgtvVolume);
}

function setMuteHandler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    async function setMute(): Promise<AlexaResponse> {
        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://audio/setMute",
            "payload": {"mute": (alexaRequest.directive.payload.mute as boolean)}
        };
        await backendControl.lgtvCommand(lgtvRequest);
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

function handler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Speaker") {
        namespaceErrorResponse(alexaRequest, "Alexa.Speaker");
    }
    switch (alexaRequest.directive.header.name) {
    case "SetVolume":
        return setVolumeHandler(alexaRequest, backendControl);
    case "AdjustVolume":
        return adjustVolumeHandler(alexaRequest, backendControl);
    case "SetMute":
        return setMuteHandler(alexaRequest, backendControl);
    default:
        return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.Speaker"));
    }
}

export {capabilities, states, handler};