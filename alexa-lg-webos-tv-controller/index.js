const smartHomeSkill = require('./lib/smart-home/index.js');
const customSkill = require('./lib/custom/index.js');

function skilllHandler(event, context, callback) {
    const smartHomeSkillHandler = smartHomeSkill.handlerLookUp(event);
    if (typeof smartHomeSkillHandler === 'function') {
        return smartHomeSkillHandler(event, context, callback);
    }
    return customSkill.handler(event, context, callback);
}

exports.handler = skilllHandler;