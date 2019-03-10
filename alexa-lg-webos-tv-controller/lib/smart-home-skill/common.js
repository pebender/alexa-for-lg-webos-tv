const {AlexaResponse} = require("alexa-lg-webos-tv-common");

function unknownDirectiveError(event) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Range Controller directive ${event.directive.header.name}`
        }
    });
    return alexaResponse.get();
}

module.exports = {
    "unknownDirectiveError": unknownDirectiveError
};