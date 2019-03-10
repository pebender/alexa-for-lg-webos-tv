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

function states() {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        const gateway = new Gateway("x");
        gateway.ping().then(
            // eslint-disable-next-line no-unused-vars
            (response) => {
                const connectivityState = AlexaResponse.createContextProperty({
                    "namespace": "Alexa.EndpointHealth",
                    "name": "connectivity",
                    "value": "OK"
                });
                resolve([connectivityState]);
            },
            // eslint-disable-next-line no-unused-vars
            (error) => {
                const connectivityState = AlexaResponse.createContextProperty({
                    "namespace": "Alexa.EndpointHealth",
                    "name": "connectivity",
                    "value": "UNREACHABLE"
                });
                resolve([connectivityState]);
            }
        );
    });
}

function handler(event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.EndpointHealth") {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": "You were sent to Endpoint Health processing in error."
                }
            });
            resolve(alexaResponse.get());
            return;
        }
        switch (event.directive.header.name) {
            default:
                resolve(unknownDirectiveError(event));
        }
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};