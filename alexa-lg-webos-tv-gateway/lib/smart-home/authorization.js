const {AlexaResponse} = require("alexa-lg-webos-tv-common");

function handler(lgtvControl, udn, event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": ""
            }
        });
        resolve(alexaResponse.get());
    });
}

module.exports = {
    "handler": handler
};