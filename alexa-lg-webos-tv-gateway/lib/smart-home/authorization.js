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
    const alexaEvent = {"event": alexaResponse.get().event};
    callback(null, alexaEvent);
}

module.exports = {
    "handler": handler
};