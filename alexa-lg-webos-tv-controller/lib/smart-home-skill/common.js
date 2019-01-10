const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const gateway = require("../gateway-api/index.js");

function sendSkillRequest(request, callback) {
    const options = {
        "hostname": "alexa.backinthirty.net",
        "username": "LGTV",
        "password": "0",
        "path": "/LGTV/SKILL"
    };
    gateway.send(options, request).then(
        (response) => {
            callback(null, response);
        },
        (error) => {
            callback(error, null);
        }
    );
}

function unknownDirectiveError(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Range Controller directive ${event.directive.header.name}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "sendSkillRequest": sendSkillRequest,
    "unknownDirectiveError": unknownDirectiveError
};