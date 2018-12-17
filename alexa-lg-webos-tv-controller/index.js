const customSkill = require('./lib/custom-skill/index.js');

function skilllHandler(event, context, callback) {
    return customSkill.handler(event, context, callback);
}

exports.handler = skilllHandler;
