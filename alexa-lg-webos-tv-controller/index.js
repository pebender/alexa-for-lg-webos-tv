const customSkill = require("./lib/custom-skill/index.js");
const smartHomeSkill = require("./lib/smart-home-skill/index.js");

function skilllHandler(event, context, callback) {
    if (Reflect.has(event, "directive")) {
        return smartHomeSkill.handler(event, context, (error, response) => callback(error, response));
    }
    return customSkill.handler(event, context, (error, response) => callback(error, response));
}

exports.handler = skilllHandler;