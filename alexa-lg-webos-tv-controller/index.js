const customSkill = require("./lib/custom-skill");
const smartHomeSkill = require("./lib/smart-home-skill");

function skilllHandler(event, context, callback) {
    if (Reflect.has(event, "directive")) {
        return smartHomeSkill.handler(event, context, (error, response) => callback(error, response));
    }
    return customSkill.handler(event, context, (error, response) => callback(error, response));
}

exports.handler = skilllHandler;