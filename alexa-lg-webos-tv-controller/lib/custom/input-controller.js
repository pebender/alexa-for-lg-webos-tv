const common = require('./common.js');

const SelectInputIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'InputController_SelectInputIntent';
    },
    async handle(handlerInput) {
        if (common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.inputController_selectInput) &&
            common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.inputController_input)) {
            const inputName = common.getSlotName(handlerInput.requestEnvelope.request.intent.slots.inputController_input);
            const inputId = common.getSlotId(handlerInput.requestEnvelope.request.intent.slots.inputController_input);
            if (inputName && inputId) {
                if (inputId.startsWith('HDMI_')) {
                    try {
                        const command = {
                            'name': 'inputSet',
                            'value': inputId
                        };
                        await common.runLGTVCommand(handlerInput, command);
                        const speechText = `You asked me to set the input to ${inputName}.`;
                        return handlerInput.responseBuilder.speak(speechText).getResponse();
                    } catch (error) {
                        const speechText = error.message;
                        return handlerInput.responseBuilder.speak(speechText).getResponse();
                    }
                } else if (inputId.startsWith('APP_')) {
                    const applicationId = inputId.substr(4);
                    const command = {
                        'name': 'applicationLaunch',
                        'value': applicationId
                    };
                    try {
                        await common.runLGTVCommand(handlerInput, command);
                        const speechText = `You asked me to set the input to ${inputName}.`;
                        return handlerInput.responseBuilder.speak(speechText).getResponse();
                    } catch (error) {
                        const speechText = error.message;
                        return handlerInput.responseBuilder.speak(speechText).getResponse();
                    }
                } else {
                    const speechText = 'Oh dear. I should not be here. You asked me for a valid input type I know nothing about.';
                    return handlerInput.responseBuilder.speak(speechText).getResponse();
                }
            } else {
                const speechText = 'You asked me to set the input to what?';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to set the input of the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};

const handlers = [SelectInputIntentHandler];

module.exports = {'handlers': handlers};