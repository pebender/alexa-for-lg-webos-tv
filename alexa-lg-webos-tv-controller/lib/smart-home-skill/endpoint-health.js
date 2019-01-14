const {unknownDirectiveError} = require("./common.js");
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
        
        const powerStateState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.EndpointHealth",
            "name": "connectivity",
            "value": lgtvControl.getPowerState(udn)
        });
        resolve([powerStateState]);
    });
}

function handler(event, callback) {
    if (event.directive.header.namespace !== "Alexa.EndpointHealth") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Endpoint Health processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    switch (event.directive.header.name) {
        default:
            unknownDirectiveError(event, (error, response) => callback(error, response));
    }
}

module.exports = {
    "capabilities": capabilities,
    "handler": handler
};