const customSkill = require("./lib/custom-skill");
const smartHomeSkill = require("./lib/smart-home-skill");

async function smartHomeSkillHandler(event, context, callback) {
    try {
        const response = await smartHomeSkill.handler(event, context);
        callback(null, response);
        return;
    } catch (error) {
        callback(error, null);
        // eslint-disable-next-line no-useless-return
        return;
    }
}

function skilllHandler(event, context, callback) {
    if (Reflect.has(event, "directive")) {
        return smartHomeSkillHandler(event, context, (error, response) => callback(error, response));
    }
    return customSkill.handler(event, context, (error, response) => callback(error, response));
}


exports.handler = skilllHandler;