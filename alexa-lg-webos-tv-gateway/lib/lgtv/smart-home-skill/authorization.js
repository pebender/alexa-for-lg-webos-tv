const {errorResponse} = require("../../common");

function handler(_lgtv, _udn, event) {
    return new Promise((resolve) => {
        resolve(errorResponse(event, "INTERNAL_ERROR", ""));
    });
}

module.exports = {
    "handler": handler
};