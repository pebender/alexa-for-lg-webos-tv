const isNumeric = require("isnumeric");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return {
        "type": "AlexaInterface",
        "interface": "Alexa.ChannelController",
        "version": "3"
    };
}

function handler(lgtvControl, event, callback) {
    if (event.directive.header.namespace !== "Alexa.ChannelController") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Channel Controller processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    switch (event.directive.header.name) {
        case "ChangeChannel":
            changeChannelHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "SkipChannels":
            skipChannelsHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (error, response) => callback(error, response));
    }
}

function changeChannelHandler(lgtvControl, event, callback) {
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
    if (Reflect.has(command, "uri") && Reflect.has(command, "payload")) {
        const {endpointId} = event.directive.endpoint;
        lgtvControl.lgtvCommand(endpointId, command, (error, response) => {
            if (error) {
                const alexaResponse = new AlexaResponse({
                    "request": event,
                    "name": "ErrorResponse",
                    "payload": {
                        "type": "INTERNAL_ERROR",
                        "message": `${error.name}: ${error.message}.`
                    }
                });
                callback(null, alexaResponse.get());
                return;
            }

            if (Reflect.has(response, "returnValue") && (response.returnValue === false)) {
                const alexaResponse = new AlexaResponse({
                    "request": event
                });
                // Dummy 'value' values.
                alexaResponse.addContextProperty({
                    "namespace": "Alexa.ChannelController",
                    "name": "channel",
                    "value": {
                        "number": "1234",
                        "callSign": "callsign1",
                        "affiliateCallSign": "callsign2"
                    }
                });
                callback(null, alexaResponse.get());
                return;
            } else {
            }
        });
    } else {
    }
}

function skipChannelsHandler(lgtvControl, event, callback) {
    callback(null, null);
}

function unknownDirectiveError(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Channel Controller directive ${event.directive.header.name}`
        }
    });
    const alexaEvent = {"event": alexaResponse.get().event};
    callback(null, alexaEvent);
}

function unknownChannelError(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INVALID_VALUE",
            "message": "The gateway doesn't recognize channel."
        }
    });
    const alexaEvent = {"event": alexaResponse.get().event};
    callback(null, alexaEvent);
}

module.exports = {
    "capabilities": capabilities,
    "handler": handler
};