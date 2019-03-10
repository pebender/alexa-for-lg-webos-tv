const {errorResponse} = require("alexa-lg-webos-tv-common");

function handler(_lgtv, _udn, event) {
    return errorResponse(event, "INTERNAL_ERROR", "");
}

module.exports = {
    "handler": handler
};