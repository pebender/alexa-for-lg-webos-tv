const authorization = require('./authorization.js');
const discovery = require('./discovery.js');
const powerController = require('./power-controller.js');
const channelController = require('./channel-controller.js');
const inputController = require('./input-controller.js');
const playbackController = require('./playback-controller.js');
const speaker = require('./speaker.js');

function getHandler(event, context) {

    if (Reflect.has(event, 'directive')) {
        switch (event.directive.header.namespace) {
            case 'Alexa.Authorization': return authorization.getHandler(event, context);
            case 'Alexa.Discovery': return discovery.getHandler(event, context);
            case 'Alexa.powerController': return powerController.getHandler(event, context);
            case 'Alexa.channelController': return channelController.getHandler(event, context);
            case 'Alexa.inputController': return inputController.getHandler(event, context);
            case 'Alexa.playbackController': return playbackController.getHandler(event, context);
            case 'Alexa.speaker': return speaker.getHandler(event, context);
            default: return null;
        }
    }
    return null;
}

module.exports = {'getHandler': getHandler};