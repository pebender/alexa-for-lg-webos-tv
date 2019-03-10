const customSkill = require("./lib/custom-skill");
const smartHomeSkill = require("./lib/smart-home-skill");

function skilllHandler(event, context, callback) {
    if (Reflect.has(event, "directive")) {
        return smartHomeSkillHandler(event, context, (error, response) => callback(error, response));
    }
    return customSkill.handler(event, context, (error, response) => callback(error, response));
}


function smartHomeSkillHandler(event, context, callback) {
    smartHomeSkill.handler(event, context).
    then((response) => callback(null, response)).
    catch((error) => callback(error, null));
}

exports.handler = skilllHandler;