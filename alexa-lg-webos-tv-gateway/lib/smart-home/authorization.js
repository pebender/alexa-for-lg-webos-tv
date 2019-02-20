const {errorResponse} = require("../common");

function handler(lgtvControl, udn, event) {
    return new Promise((resolve) => {
        resolve(errorResponse(event, "INTERNAL_ERROR", ""));
    });
}

module.exports = {
    "handler": handler
};