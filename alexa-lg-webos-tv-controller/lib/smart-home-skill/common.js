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

module.exports = {
    "sendSkillRequest": sendSkillRequest
};