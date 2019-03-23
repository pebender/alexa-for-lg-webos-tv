const isNumeric = require("isnumeric");
import {namespaceErrorResponse, directiveErrorResponse, errorToErrorResponse, errorResponse} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {AlexaRequest, AlexaResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "../../backend";

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv: BackendController, _alexaRequest: AlexaRequest, _udn: UDN): {[x: string]: any}[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.ChannelController",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line no-unused-vars
function states(_lgtv: BackendController, _udn: UDN): {[x: string]: any}[] {
    return [];
}

function handler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.ChannelController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.ChannelController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "ChangeChannel":
            return changeChannelHandler(lgtv, alexaRequest);
        case "SkipChannels":
            return skipChannelsHandler(lgtv, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.ChannelController"));
    }
}

async function changeChannelHandler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    const channelCommand = await getCommand();
    return setChannel(channelCommand);

    function getCommand(): {uri: string, payload: string} | null {
        const command: {
            uri?: string,
            payload?: any
        } = {};
        if (Reflect.has(alexaRequest.directive, "payload")) {
            const {payload} = alexaRequest.directive;
            if (Reflect.has(payload, "channel") && Reflect.has(payload.channel, "number")) {
                if (isNumeric(payload.channel.number)) {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelNumber": payload.channel.number};
                } else {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelId": payload.channel.number};
                }
            } else if (Reflect.has(payload, "channel") && Reflect.has(payload.channel, "callSign")) {
                if (isNumeric(payload.channel.callSign)) {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelNumber": payload.channel.callSign};
                } else {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelId": payload.channel.callSign};
                }
            } else if (Reflect.has(payload, "channel") && Reflect.has(payload.channel, "affiliateCallSign")) {
                if (isNumeric(payload.channel.affiliateCallSign)) {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelNumber": payload.channel.affiliateCallSign};
                } else {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelId": payload.channel.affiliateCallSign};
                }
            } else if (Reflect.has(payload, "channelMetadata") && Reflect.has(payload.channelMetadata, "name")) {
                if (isNumeric(payload.channelMetadata.name)) {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelNumber": payload.channelMetadata.name};
                } else {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelId": payload.channelMetadata.name};
                }
            }
        }
        if (Reflect.has(command, "uri") === false || Reflect.has(command, "payload") === false) {
            return null;
        }
        return <{uri: string, payload: any}>command;
    }

    async function setChannel(command: {uri: string, payload: any} | null): Promise<AlexaResponse> {
        if (command === null) {
            return unknownChannelError(lgtv, alexaRequest);
        }
        const {endpointId} = alexaRequest.directive.endpoint;
        try {
            await lgtv.lgtvCommand(endpointId, command);
        } catch (error) {
            return errorToErrorResponse(alexaRequest, error);
        }

        // const [state] = await states(lgtv, null);
        // Dummy 'value' values.
        const state = AlexaResponse.createContextProperty({
            "namespace": "Alexa.ChannelController",
            "name": "channel",
            "value": {
                "number": "1234",
                "callSign": "callsign1",
                "affiliateCallSign": "callsign2"
            }
        });
        const alexaResponse = new AlexaResponse({
            "request": alexaRequest,
            "namespace": "Alexa",
            "name": "Response"
        });
        alexaResponse.addContextProperty(state);
        return alexaResponse;
    }
}

function skipChannelsHandler(_lgtv: BackendController, alexaRequest: AlexaRequest):  Promise<AlexaResponse> {
    return Promise.resolve(errorResponse(alexaRequest, "UNKNOWN_ERROR", "'Alexa.ChannelController.SkipChannels' is not supported."));
}

function unknownChannelError(_lgtv: BackendController, alexaRequest: AlexaRequest) {
    return errorResponse(alexaRequest, "INVALID_VALUE", "The gateway doesn't recognize channel.");
}

export {capabilities, states, handler};