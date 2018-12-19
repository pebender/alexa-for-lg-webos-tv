const common = require('./common.js');

const TurnOffIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'PowerController_TurnOffIntent';
    },
    async handle(handlerInput) {
        if (common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.powerController_turnOff)) {
            try {
                const command = {'name': 'turnOff'};
                await common.runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to turn off the television.';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to turn off the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const TurnOnIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'PowerController_TurnOnIntent';
    },
    async handle(handlerInput) {
        if (common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.powerController_turnOn)) {
            try {
                const command = {'name': 'turnOn'};
                await common.runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to turn on the television.';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to turn on the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};

const handlers = [
    TurnOffIntentHandler,
    TurnOnIntentHandler
];

module.exports = {'handlers': handlers};