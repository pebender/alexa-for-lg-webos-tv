import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "../../../common";
import {BackendControl} from "../backend";
import LGTV from "lgtv2";

const alexaToLGTV: {[lgtvInput: string]: {[alexaInput: string]: string}} = {
    // Amazon Video
    "amzn1.alexa-ask-target.app.72095": {
        "id": "amazon"
    },
    // Hulu
    "amzn1.alexa-ask-target.app.77683": {
        "id": "hulu"
    },
    // Netflix
    "amzn1.alexa-ask-target.app.36377": {
        "id": "netflix"
    },
    // Plex
    "amzn1.alexa-ask-target.app.78079": {
        "id": "cdp-30"
    },
    // Vudu
    "amzn1.alexa-ask-target.app.64811": {
        "id": "vudu"
    },
    // YouTube
    "amzn1.alexa-ask-target.app.70045": {
        "id": "youtube.leanback.v4"
    }
};

const lgtvToAlexa: {[AlexaInput: string]: {identifier: string; name: string}} = {
    "amazon": {
        "identifier": "amzn1.alexa-ask-target.app.72095",
        "name": "Amazon Video"
    },
    "hulu": {
        "identifier": "amzn1.alexa-ask-target.app.77683",
        "name": "Hulu"
    },
    "netflix": {
        "identifier": "amzn1.alexa-ask-target.app.36377",
        "name": "Netflix"
    },
    "cdp-30": {
        "identifier": "amzn1.alexa-ask-target.app.78079",
        "name": "Plex"
    },
    "vudu": {
        "identifier": "amzn1.alexa-ask-target.app.64811",
        "name": "Vudu"
    },
    "youtube.leanback.v4": {
        "identifier": "amzn1.alexa-ask-target.app.70045",
        "name": "YouTube"
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(backendControl: BackendControl): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        Promise.resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.Launcher",
            "version": "3",
            "properties": {
                "supported": [
                    {
                        "name": "identifier"
                    },
                    {
                        "name": "name"
                    }
                ],
                "proactivelyReported": false,
                "retrievable": true
            }
        })
    ];
}

function states(backendControl: BackendControl): Promise<AlexaResponseContextProperty>[] {
    if (backendControl.getPowerState() === "OFF") {
        return [];
    }

    async function value(): Promise<{identifier: string; name: string} | null> {
        const lgtvRequest: LGTV.Request = {
            "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
        };
        const input: LGTV.Response = await backendControl.lgtvCommand(lgtvRequest);
        if (typeof input.appId !== "string" ||
            typeof lgtvToAlexa[input.appId] === "undefined") {
            return null;
        }
        return lgtvToAlexa[input.appId];
    }

    const targetState = AlexaResponse.buildContextProperty({
        "namespace": "Alexa.Launcher",
        "name": "target",
        "value": value
    });
    return [targetState];
}

/*
 * A list of Alexa target identifiers can be found at
 * <https://developer.amazon.com/docs/video/launch-target-reference.html>.
 * A list of LG webOS TV target ids can be found bet issuing the command
 * "ssap://com.webos.applicationManager/listLaunchPoints".
 */
async function launchTargetHandler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    if (typeof alexaRequest.directive.payload.identifier !== "string" ||
        typeof alexaToLGTV[(alexaRequest.directive.payload.identifier as string)] === "undefined") {
        return errorResponse(
            alexaRequest,
            "INTERNAL_ERROR",
            `I do not know the Launcher target ${alexaRequest.directive.payload.identifier}`
        );
    }
    const lgtvRequest: LGTV.Request = {
        "uri": "ssap://system.launcher/launch",
        "payload": alexaToLGTV[alexaRequest.directive.payload.identifier]
    };
    // eslint-disable-next-line no-unused-vars
    await backendControl.lgtvCommand(lgtvRequest);
    return new AlexaResponse({
        "namespace": "Alexa",
        "name": "Response",
        "correlationToken": alexaRequest.getCorrelationToken(),
        "endpointId": alexaRequest.getEndpointId()
    });
}

function handler(alexaRequest: AlexaRequest, backendControl: BackendControl): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Launcher") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.Launcher"));
    }
    switch (alexaRequest.directive.header.name) {
    case "LaunchTarget":
        return launchTargetHandler(alexaRequest, backendControl);
    default:
        return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.Launcher"));
    }
}

export {capabilities, states, handler};