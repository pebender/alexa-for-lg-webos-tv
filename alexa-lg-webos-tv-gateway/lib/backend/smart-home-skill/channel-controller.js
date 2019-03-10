const isNumeric = require("isnumeric");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {namespaceErrorResponse, directiveErrorResponse, errorResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv, _event, _udn) {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.ChannelController",
            "version": "3"
        }
    ];
}

// eslint-disable-next-line no-unused-vars
function states(_lgtv, _udn) {
    return [];
}

function handler(lgtv, event) {
    if (event.directive.header.namespace !== "Alexa.ChannelController") {
        return namespaceErrorResponse(event, "Alexa.ChannelController");
    }
    switch (event.directive.header.name) {
        case "ChangeChannel":
            return changeChannelHandler(lgtv, event);
        case "SkipChannels":
            return skipChannelsHandler(lgtv, event);
        default:
            return directiveErrorResponse(lgtv, event);
    }
}

async function changeChannelHandler(lgtv, event) {
    const channelCommand = await getCommand();
    return setChannel(channelCommand);

    function getCommand() {
        const command = {};
        if (Reflect.has(event.directive, "payload")) {
            const {payload} = event.directive;
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
        return command;
    }

    async function setChannel(command) {
        if (command === null) {
            return unknownChannelError(lgtv, event);
        }
        const {endpointId} = event.directive.endpoint;
        try {
            await lgtv.lgtvCommand(endpointId, command);
        } catch (error) {
            return {};
        }

        // const [state] = await states(lgtv, null);
        // Dummy 'value' values.
        const state = {
            "namespace": "Alexa.ChannelController",
            "name": "channel",
            "value": {
                "number": "1234",
                "callSign": "callsign1",
                "affiliateCallSign": "callsign2"
            }
        };
        const alexaResponse = new AlexaResponse({
            "request": event
        });
        alexaResponse.addContextProperty(state);
        return alexaResponse.get();
    }
}

// eslint-disable-next-line no-unused-vars
function skipChannelsHandler(_lgtv, _event) {
    return null;
}

function unknownChannelError(_lgtv, event) {
    return errorResponse(event, "INVALID_VALUE", "The gateway doesn't recognize channel.");
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};