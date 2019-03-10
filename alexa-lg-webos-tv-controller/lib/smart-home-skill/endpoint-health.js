const {unknownDirectiveError} = require("./common");
const Gateway = require("../gateway-api");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(event) {
    return [
        {
            "type": "AlexaInterface",
            "interface": "Alexa.EndpointHealth",
            "version": "3",
            "properties": {
                "supported": [
                    {
                        "name": "connectivity"
                    }
                ],
                "proactivelyReported": false,
                "retrievable": true
            }
        }
    ];
}

async function states() {
    const gateway = new Gateway("x");
    try {
        await gateway.ping();
        const connectivityState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.EndpointHealth",
            "name": "connectivity",
            "value": "OK"
        });
        return [connectivityState];
    } catch (_error) {
        const connectivityState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.EndpointHealth",
            "name": "connectivity",
            "value": "UNREACHABLE"
        });
        return [connectivityState];
    }
}

function handler(event) {
    if (event.directive.header.namespace !== "Alexa.EndpointHealth") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Endpoint Health processing in error."
            }
        });
        return alexaResponse.get();
    }
    switch (event.directive.header.name) {
        default:
            return unknownDirectiveError(event);
    }
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};