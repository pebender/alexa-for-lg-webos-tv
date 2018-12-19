const common = require('./common.js');

const DecreaseVolumeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'Speaker_DecreaseVolumeIntent';
    },
    async handle(handlerInput) {
        if (common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.speaker_decreaseVolume)) {
            try {
                const command = {'name': 'decreaseVolume'};
                await common.runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to decrease the volume of the television';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to decrease the volume of the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const IncreaseVolumeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'Speaker_IncreaseVolumeIntent';
    },
    async handle(handlerInput) {
        if (common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.speaker_increaseVolume)) {
            try {
                const command = {'name': 'increaseVolume'};
                await common.runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to increase the volume of the television';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to increase the volume of the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const SetVolumeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'Speaker_SetVolumeIntent';
    },
    async handle(handlerInput) {
        if (common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.speaker_setVolume)) {
            const volume = handlerInput.requestEnvelope.request.intent.slots.setVolume.value;
            if (volume && volume >= 0) {
                try {
                    const command = {
                        'name': 'volumeSet',
                        'value': volume
                    };
                    await common.runLGTVCommand(handlerInput, command);
                    const speechText = `You asked me to set the volume to ${volume}.`;
                    return handlerInput.responseBuilder.speak(speechText).getResponse();
                } catch (error) {
                    const speechText = error.message;
                    return handlerInput.responseBuilder.speak(speechText).getResponse();
                }
            } else {
                const speechText = 'I did not understand. You asked me to set the volume to what?';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to set the volume of the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const MuteIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'Speaker_MuteIntent';
    },
    async handle(handlerInput) {
        if (common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.speaker_mute)) {
            try {
                const command = {
                    'name': 'setMute',
                    'value': 'on'
                };
                await common.runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to mute the television.';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to mute the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const UnmuteIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'Speaker_UnmuteIntent';
    },
    async handle(handlerInput) {
        if (common.checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.speaker_unmute)) {
            try {
                const command = {
                    'name': 'setMute',
                    'value': 'off'
                };
                await common.runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to unmute the television.';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to unmute the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};

const handlers = [
    DecreaseVolumeIntentHandler,
    IncreaseVolumeIntentHandler,
    SetVolumeIntentHandler,
    MuteIntentHandler,
    UnmuteIntentHandler
];

module.exports = {'handlers': handlers};