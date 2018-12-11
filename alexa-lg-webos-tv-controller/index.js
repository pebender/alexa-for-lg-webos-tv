const httpBind = require('./lib/http-bind.js');
const httpPost = require('./lib/http-post.js');
const lgtvBind = require('./lib/lgtv-bind.js');


const Alexa = require('ask-sdk');
const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  'tableName': 'LGwebOSTVController',
  'createTable': true
});

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'There is a manual around here somewhere.';
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
             handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'There is a switch around here somewhere.';
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};
const PowerOffIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'PowerOffIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.PowerOff)) {
            try {
                const command = {'name': 'powerOff'};
                await runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to power off the television.';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to power off the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const PowerOnIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'PowerOnIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.PowerOn)) {
            try {
                const command = {'name': 'powerOn'};
                await runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to power on the television.';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to power on the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const VolumeDownIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'VolumeDownIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.VolumeDown)) {
            try {
                const command = {'name': 'volumeDown'};
                await runLGTVCommand(handlerInput, command);
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
const VolumeUpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'VolumeUpIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.VolumeUp)) {
            try {
                const command = {'name': 'volumeUp'};
                await runLGTVCommand(handlerInput, command);
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
const VolumeSetIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'VolumeSetIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.VolumeSet)) {
            const volume = handlerInput.requestEnvelope.request.intent.slots.VolumeSet.value;
            if (volume && volume >= 0) {
                try {
                    const command = {
                        'name': 'volumeSet',
                        'value': volume
                    };
                    await runLGTVCommand(handlerInput, command);
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
const VolumeMuteIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'VolumeMuteIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.VolumeMute)) {
            try {
                const command = {
                    'name': 'muteSet',
                    'value': 'on'
                };
                await runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to mute the volume of the television.';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to mute the volume of the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const VolumeUnmuteIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'VolumeUnmuteIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.VolumeUnmute)) {
            try {
                const command = {
                    'name': 'muteSet',
                    'value': 'off'
                };
                await runLGTVCommand(handlerInput, command);
                const speechText = 'You asked me to unmute the volume of the television.';
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to unmute the volume of the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const InputSetIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'InputSetIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.InputSet) &&
            checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.Input)) {
            const inputName = getSlotName(handlerInput.requestEnvelope.request.intent.slots.Input);
            const inputId = getSlotId(handlerInput.requestEnvelope.request.intent.slots.Input);
            if (inputName && inputId) {
                if (inputId.startsWith('HDMI_')) {
                    try {
                        const command = {
                            'name': 'inputSet',
                            'value': inputId
                        };
                        await runLGTVCommand(handlerInput, command);
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
                        await runLGTVCommand(handlerInput, command);
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
const MessageShowIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'MessageShowIntent';
    },
    async handle(handlerInput) {
        if (checkSlotStatusCode(handlerInput.requestEnvelope.request.intent.slots.MessageShow)) {
            const message = handlerInput.requestEnvelope.request.intent.slots.Message.value;
            const command = {
                'name': 'messageShow',
                'value': message
            };
            try {
                await runLGTVCommand(handlerInput, command);
                const speechText = `You asked me to show the message ${message}.`;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            } catch (error) {
                const speechText = error.message;
                return handlerInput.responseBuilder.speak(speechText).getResponse();
            }
        } else {
            const speechText = 'I did not understand. Maybe you wanted me to show a message on the television';
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        }
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    async handle(handlerInput) {
        try {
            await handlerInput.attributesManager.savePersistentAttributes();
        } catch (error) {
            throw error;
        }
        return handlerInput.responseBuilder.getResponse();
    }
};
const handlers = [
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    PowerOffIntentHandler,
    PowerOnIntentHandler,
    VolumeDownIntentHandler,
    VolumeUpIntentHandler,
    VolumeSetIntentHandler,
    VolumeMuteIntentHandler,
    VolumeUnmuteIntentHandler,
    InputSetIntentHandler,
    MessageShowIntentHandler,
    SessionEndedRequestHandler
];

const ErrorHandler = {
    canHandle() {
      return true;
    },
    // eslint-disable-next-line no-unused-vars
    handle(handlerInput, _error) {
        return handlerInput.responseBuilder.
            speak('Sorry, I can\'t understand the command. Please say again.').
            reprompt('Sorry, I can\'t understand the command. Please say again.').
            getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom().
    addRequestHandlers(...lgtvBind.handlers, ...httpBind.handlers, ...handlers).
    addErrorHandlers(ErrorHandler).
    withPersistenceAdapter(persistenceAdapter).
    lambda();

function checkSlotStatusCode(slot) {
    const match =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH';
    return match;
}

function getSlotName(slot) {
    const name =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0] &&
        slot.resolutions.resolutionsPerAuthority[0].values &&
        slot.resolutions.resolutionsPerAuthority[0].values.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    return name;
}

function getSlotId(slot) {
    const id =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0] &&
        slot.resolutions.resolutionsPerAuthority[0].values &&
        slot.resolutions.resolutionsPerAuthority[0].values.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    return id;
}

async function runLGTVCommand(handlerInput, command) {
    let attributes = {};
    try {
        attributes = await handlerInput.attributesManager.getPersistentAttributes();
    } catch (error) {
        throw error;
    }
    if (!Reflect.has(attributes, 'hostname')) {
        throw new Error('I need to know your gateway\'s hostname before I can control any televisions.');
    }
    if (!Reflect.has(attributes, 'password')) {
        throw new Error('I need to know your gateway\'s password before I can control any televisions.');
    }
//   if (!Reflect.has(attributes, 'tvmap') || !Reflect.has(attributes.tvmap, handlerInput.requestEnvelope.context.System.device.deviceId)) {
//        const error = new Error('You have not configured this Alexa to control an L.G. web O.S. T.V..');
//        throw error;
//    }
    try {
        const options = {
            'hostname': attributes.hostname,
            'path': '/LGTV/RUN',
            'username': 'LGTV',
            'password': attributes.password
        };
        const request = {
//            'television': attributes[handlerInput.requestEnvelope.context.System.device.deviceId],
// Hack until I get LGTV binding to work. This is the UDN specific to my television.
            'television': 'uuid:261b0bf7-1437-ed2d-5eaf-ab701fd699e3',
            'command': command
        };
        return await httpPost.post(options, request);
    } catch (error) {
        throw (error);
    }
}