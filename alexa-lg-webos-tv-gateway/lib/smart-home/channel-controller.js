const isNumeric = require("isnumeric");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse, errorResponse} = require("../common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvController, _event, _udn) {
    return new Promise((resolve) => {
        resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.ChannelController",
            "version": "3"
        });
    });
}

// eslint-disable-next-line no-unused-vars
function states(lgtvController, udn) {
    return new Promise((resolve) => {
        resolve([]);
    });
}

function handler(lgtvController, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.ChannelController") {
            resolve(namespaceErrorResponse(event, "Alexa.ChannelController"));
            return;
        }
        switch (event.directive.header.name) {
            case "ChangeChannel":
                resolve(changeChannelHandler(lgtvController, event));
                break;
            case "SkipChannels":
                resolve(skipChannelsHandler(lgtvController, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtvController, event));
                break;
        }
    });
}

function changeChannelHandler(lgtvController, event) {
    return getCommand().
        then(setChannel);

    function getCommand() {
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
                resolve(command);
            } else {
                resolve(null);
            }
        });
    }

    function setChannel(command) {
        return new Promise((resolve) => {
            if (command !== null) {
                const {endpointId} = event.directive.endpoint;
                resolve(lgtvController.lgtvCommand(endpointId, command).
                    then((response) => {
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
                            return alexaResponse.get();
                        }
                        return {};
                    }));
            }
        });
    }
}

// eslint-disable-next-line no-unused-vars
function skipChannelsHandler(_lgtvController, _event) {
    return new Promise((resolve) => {
        resolve(null);
    });
}

function unknownChannelError(lgtvController, event) {
    return errorResponse(event, "INVALID_VALUE", "The gateway doesn't recognize channel.");
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};