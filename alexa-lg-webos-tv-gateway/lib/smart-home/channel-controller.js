const isNumeric = require("isnumeric");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {errorToErrorResponse, directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("../common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return new Promise((resolve) => {
        resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.ChannelController",
            "version": "3"
        });
    });
}

// eslint-disable-next-line no-unused-vars
function states(lgtvControl, udn) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        resolve([]);
    });
}

function handler(lgtvControl, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.ChannelController") {
            resolve(namespaceErrorResponse(event, "Alexa.ChannelController"));
            return;
        }
        switch (event.directive.header.name) {
            case "ChangeChannel":
                resolve(changeChannelHandler(lgtvControl, event));
                break;
            case "SkipChannels":
                resolve(skipChannelsHandler(lgtvControl, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtvControl, event));
                break;
        }
    });
}

function changeChannelHandler(lgtvControl, event) {
    return new Promise((resolve) => {
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
                    resolve(errorToErrorResponse(event, error));
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
                    resolve(alexaResponse.get());
                }
            });
        }
    });
}

// eslint-disable-next-line no-unused-vars
function skipChannelsHandler(_lgtvControl, _event) {
    return new Promise((resolve) => {
        resolve(null);
    });
}

function unknownChannelError(lgtvControl, event) {
    return errorResponse(event, "INVALID_VALUE", "The gateway doesn't recognize channel.");
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};