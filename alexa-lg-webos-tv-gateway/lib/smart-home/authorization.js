const {AlexaResponse} = require("alexa-lg-webos-tv-common");

function handler(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": ""
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "handler": handler
};