import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    LGTVRequest,
    LGTVRequestPayload,
    directiveErrorResponse,
    errorResponse,
    errorToErrorResponse,
    namespaceErrorResponse} from "../../../../common";
import {Backend} from "../../backend";
import {UDN} from "../../tv";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isNumeric = require("isnumeric");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_lgtv: Backend, _alexaRequest: AlexaRequest, _udn: UDN): AlexaResponseEventPayloadEndpointCapability[] {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.ChannelController",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(_backend: Backend, _udn: UDN): AlexaResponseContextProperty[] {
    return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function skipChannelsHandler(_lgtv: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return Promise.resolve(errorResponse(alexaRequest, "UNKNOWN_ERROR", "'Alexa.ChannelController.SkipChannels' is not supported."));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function unknownChannelError(_lgtv: Backend, alexaRequest: AlexaRequest): AlexaResponse {
    return errorResponse(alexaRequest, "INVALID_VALUE", "The gateway doesn't recognize channel.");
}

async function changeChannelHandler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    function getCommand(): LGTVRequest | null {
        const command: {
            uri?: string;
            payload?: LGTVRequestPayload;
        } = {
            "uri": null
        };
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
        return (command as LGTVRequest);
    }

    async function setChannel(command: LGTVRequest | null): Promise<AlexaResponse> {
        if (command === null) {
            return unknownChannelError(backend, alexaRequest);
        }
        const udn: UDN = (alexaRequest.directive.endpoint.endpointId as UDN);
        try {
            await backend.lgtvCommand(udn, command);
        } catch (error) {
            return errorToErrorResponse(alexaRequest, error);
        }

        /*
         * X const [state] = await states(lgtv, null);
         * Dummy 'value' values.
         */
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
            "namespace": "Alexa",
            "name": "Response",
            "correlationToken": alexaRequest.getCorrelationToken(),
            "endpointId": alexaRequest.getEndpointId()
        });
        alexaResponse.addContextProperty(state);
        return alexaResponse;
    }

    const channelCommand = await getCommand();
    return setChannel(channelCommand);
}

function handler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.ChannelController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, "Alexa.ChannelController"));
    }
    switch (alexaRequest.directive.header.name) {
        case "ChangeChannel":
            return changeChannelHandler(backend, alexaRequest);
        case "SkipChannels":
            return skipChannelsHandler(backend, alexaRequest);
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, "Alexa.ChannelController"));
    }
}


export {capabilities, states, handler};