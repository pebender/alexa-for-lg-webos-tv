import * as ASH from  "../../../common/alexa";
import {BackendControl} from "../backend";
import LGTV from "lgtv2";    

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backendControl: BackendControl): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
    return [ASH.Response.buildPayloadEndpointCapability({
        "namespace": "Alexa.Speaker",
        "propertyNames": ["volume", "muted"]
    })];
}

function states(backendControl: BackendControl): Promise<ASH.ResponseContextProperty>[] {
    function getVolumeState(): Promise<ASH.ResponseContextProperty> {
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

        const volumeState = ASH.Response.buildContextProperty({
            "namespace": "Alexa.Speaker",
            "name": "volume",
            "value": value
        });
        return volumeState;
    }

    function getMutedState(): Promise<ASH.ResponseContextProperty> {
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

        const mutedState = ASH.Response.buildContextProperty({
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

async function setVolumeHandler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    function getVolume(): number {
        const {volume} = alexaRequest.directive.payload;
        if (typeof volume !== "number" || volume < 0 || volume > 100) {
            throw new RangeError("volume must be between 0 and 100 inclusive");
        }
        return volume;
    }

    async function setVolume(volume: number): Promise<ASH.Response> {
        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await backendControl.lgtvCommand(lgtvRequest);
        return new ASH.Response({
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
        return Promise.resolve(ASH.errorResponse(
            alexaRequest,
            error.name,
            error.message
        ));
    }
    return setVolume(lgtvVolume);
}

async function adjustVolumeHandler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
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

    async function setVolume(volume: number): Promise<ASH.Response> {
        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://audio/setVolume",
            "payload": {"volume": volume}
        };
        await backendControl.lgtvCommand(lgtvRequest);
        return new ASH.Response({
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
        return Promise.resolve(ASH.errorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            error.message
        ));
    }
    return setVolume(lgtvVolume);
}

function setMuteHandler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    async function setMute(): Promise<ASH.Response> {
        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://audio/setMute",
            "payload": {"mute": (alexaRequest.directive.payload.mute as boolean)}
        };
        await backendControl.lgtvCommand(lgtvRequest);
        const alexaResponse = new ASH.Response({
            "namespace": "Alexa",
            "name": "Response",
            "correlationToken": alexaRequest.getCorrelationToken(),
            "endpointId": alexaRequest.getEndpointId()
        });

        return alexaResponse;
    }

    return setMute();
}

function handler(alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Speaker") {
        ASH.errorResponseForWrongNamespace(alexaRequest, "Alexa.Speaker");
    }
    switch (alexaRequest.directive.header.name) {
    case "SetVolume":
        return setVolumeHandler(alexaRequest, backendControl);
    case "AdjustVolume":
        return adjustVolumeHandler(alexaRequest, backendControl);
    case "SetMute":
        return setMuteHandler(alexaRequest, backendControl);
    default:
        return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
    }
}

export {capabilities, states, handler};