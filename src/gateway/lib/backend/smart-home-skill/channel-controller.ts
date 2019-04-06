import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    LGTVRequest,
    directiveErrorResponse,
    errorResponse,
    errorToErrorResponse,
    namespaceErrorResponse} from "../../../../common";
import {Backend} from "../../backend";
import {UDN} from "../../tv";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isNumeric = require("isnumeric");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_lgtv: Backend, _alexaRequest: AlexaRequest, _udn: UDN): Promise<AlexaResponseEventPayloadEndpointCapability>[] {
    return [
        Promise.resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.ChannelController",
            "version": "3"
        })
    ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function states(_backend: Backend, _udn: UDN): Promise<AlexaResponseContextProperty>[] {
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
            uri: string;
            payload?: {
                channelNumber?: number;
                channelId?: string;
            };
        } = {
            "uri": ""
        };
        if (typeof alexaRequest.directive.payload !== "undefined") {
            // eslint-disable-next-line prefer-destructuring
            const payload: {
                channel?: {
                    number?: number | string;
                    callSign?: number | string;
                    affiliateCallSign?: number | string;
                };
                channelMetadata?: {
                    name?: number | string;
                };
                [x: string]: boolean | number | string | object | undefined;
            } = alexaRequest.directive.payload;
            if (typeof payload.channel !== "undefined" && typeof payload.channel.number !== "undefined") {
                if (isNumeric(payload.channel.number)) {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelNumber": (payload.channel.number as number)};
                } else {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelId": (payload.channel.number as string)};
                }
            } else if (typeof payload.channel !== "undefined" && typeof payload.channel.callSign !== "undefined") {
                if (isNumeric(payload.channel.callSign)) {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelNumber": (payload.channel.callSign as number)};
                } else {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelId": (payload.channel.callSign as string)};
                }
            } else if (typeof payload.channel !== "undefined" && typeof payload.channel.affiliateCallSign !== "undefined") {
                if (isNumeric(payload.channel.affiliateCallSign)) {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelNumber": (payload.channel.affiliateCallSign as number)};
                } else {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelId": (payload.channel.affiliateCallSign as string)};
                }
            } else if (typeof payload.channelMetadata !== "undefined" && typeof payload.channelMetadata.name !== "undefined") {
                if (isNumeric(payload.channelMetadata.name)) {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelNumber": (payload.channelMetadata.name as number)};
                } else {
                    command.uri = "ssap://tv/openChannel";
                    command.payload = {"channelId": (payload.channelMetadata.name as string)};
                }
            }
        }
        if (typeof command.uri === "undefined" || typeof command.payload === "undefined") {
            return null;
        }
        return (command as LGTVRequest);
    }

    async function setChannel(command: LGTVRequest | null): Promise<AlexaResponse> {
        if (command === null) {
            return unknownChannelError(backend, alexaRequest);
        }
        const udn: UDN | undefined = alexaRequest.getEndpointId();
        if (typeof udn === "undefined") {
            return errorResponse(alexaRequest, "INTERNAL_ERROR", "invalid code path");
        }
        try {
            await backend.lgtvCommand(udn, command);
        } catch (error) {
            return errorToErrorResponse(alexaRequest, error);
        }

        /*
         * X const [state] = await states(lgtv, null);
         * Dummy 'value' values.
         */
        const state: AlexaResponseContextProperty = {
            "namespace": "Alexa.ChannelController",
            "name": "channel",
            "value": {
                "number": "1234",
                "callSign": "callsign1",
                "affiliateCallSign": "callsign2"
            },
            "timeOfSample": new Date().toISOString(),
            "uncertaintyInMilliseconds": 0
        };
        const alexaResponse = new AlexaResponse({
            "namespace": "Alexa",
            "name": "Response",
            "correlationToken": alexaRequest.getCorrelationToken(),
            "endpointId": alexaRequest.getEndpointId()
        });
        alexaResponse.addContextProperty(await AlexaResponse.buildContextProperty({
            "namespace": "Alexa.ChannelController",
            "name": "channel",
            "value": () => {
                const value = {
                    "number": "1234",
                    "callSign": "callsign1",
                    "affiliateCallSign": "callsign2"
                };
                return value;
            }
        }));
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