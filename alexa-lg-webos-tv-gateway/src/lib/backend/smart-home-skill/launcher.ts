import {UDN} from "../../common";
import {BackendController} from "../backend-controller";
import {AlexaRequest, AlexaResponse} from "alexa-lg-webos-tv-common";
const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("alexa-lg-webos-tv-common");

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

const lgtvToAlexa: {[AlexaInput: string]: {identifier: string, name: string}} = {
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

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _event: AlexaRequest, _udn: UDN) {
    return [
        {
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
        }
    ];
}

async function states(lgtv: BackendController, udn: UDN): Promise<any[]> {
    try {
        const lgtvInput: {appId: string, [x: string]: any} | null = await getInput();
        const alexaInput: {identifier: string, name: string} | null = mapInput(<{appId: string, [x: string]: any}>lgtvInput);
        return buildStates(alexaInput);
    } catch (error) {
        return [];
    }

    async function getInput(): Promise<{appId: string, [x: string]: any} | null> {
        if (lgtv.getPowerState(udn) === "OFF") {
            return null;
        }

        const command = {
            "uri": "ssap://com.webos.applicationManager/getForegroundAppInfo"
        };
        const input = await lgtv.lgtvCommand(udn, command);
        return <{appId: string, [x: string]: any}>input;
    }

    function mapInput(input: {appId: string, [x: string]: any}): {identifier: string, name: string} | null {
        if (Reflect.has(lgtvToAlexa, input.appId) === false) {
            return null;
        }
        return lgtvToAlexa[<string>input.appId];
    }

    function buildStates(target: {identifier: string, name: string} | null) {
        if (target === null) {
            return [];
        }
        const targetState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.Launcher",
            "name": "target",
            "value": target
        });
        return [targetState];
    }
}

function handler(lgtv: BackendController, event: AlexaRequest) {
    if (event.directive.header.namespace !== "Alexa.Launcher") {
        return namespaceErrorResponse(event, "Alexa.Launcher");
    }
    switch (event.directive.header.name) {
        case "LaunchTarget":
            return launchTargetHandler(lgtv, event);
        default:
            return directiveErrorResponse(lgtv, event);
    }
}

/*
 * A list of Alexa target identifiers can be found at
 * <https://developer.amazon.com/docs/video/launch-target-reference.html>.
 * A list of LG webOS TV target ids can be found bet issuing the command
 * "ssap://com.webos.applicationManager/listLaunchPoints".
 */
async function launchTargetHandler(lgtv: BackendController, event: AlexaRequest) {
    if (Reflect.has(alexaToLGTV, event.directive.payload.identifier)) {
        return errorResponse(
            event,
            "INTERNAL_ERROR",
            `I do not know the Launcher target ${event.directive.payload.identifier}`
        );
    }
    const {endpointId} = event.directive.endpoint;
    const command = {
        "uri": "ssap://system.launcher/launch",
        "payload": alexaToLGTV[event.directive.payload.identifier]
    };
    // eslint-disable-next-line no-unused-vars
    await lgtv.lgtvCommand(endpointId, command);
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    return alexaResponse.get();
}

export {capabilities, states, handler};