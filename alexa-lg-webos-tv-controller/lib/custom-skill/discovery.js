const gateway = require('../gateway-api/index.js');

const RequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'Request';
    },
    async handle(handlerInput) {
        let persistentAttributes = {};
        try {
            persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        } catch (error) {
            return handlerInput.responseBuilder.
            speak('I had a problem and we will have to start over.' +
                ' A card in the Alexa app shows more.').
            withSimpleCard('Error', `${error.name}: ${error.message}`).
            getResponse();
        }

        if (!Reflect.has(persistentAttributes, 'hostname')) {
            return handlerInput.responseBuilder.
                speak('I need to know your gateway\'s hostname before I can find any televisions.').
                getResponse();
        }
        if (!Reflect.has(persistentAttributes, 'password')) {
            return handlerInput.responseBuilder.
                speak('I need to know your gateway\'s hostname before I can find any televisions.').
                getResponse();
        }

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (handlerInput.requestEnvelope.request.dialogState === 'STARTED') {
            if (Reflect.has(sessionAttributes, 'udn')) {
                Reflect.deleteProperty(sessionAttributes, 'udn');
            }
            sessionAttributes.udn = {};
            sessionAttributes.udn.configurationStatus = 'NONE';

            if (!Reflect.has(persistentAttributes, 'tvmap')) {
                Reflect.deleteProperty(persistentAttributes, 'tvmap');
            }

            try {
                const options = {
                    'hostname': persistentAttributes.hostname,
                    'path': '/LGTV/MAP',
                    'username': 'LGTV',
                    'password': persistentAttributes.password
                };
                const request = {'command': {'name': 'udnsGet'}};
                const response = await gateway.send(options, request);
                if (!Reflect.has(response, 'udns')) {
                    return handlerInput.responseBuilder.
                        speak('I could not find an L.G. web O.S. T.V.').
                        getResponse();
                }
                if (response.udns.length === 0) {
                    return handlerInput.responseBuilder.
                        speak('That was the last L.G. web O.S. T.V. I found.').
                        getResponse();
                }
                sessionAttributes.udns = [];
                let index = 0;
                for (index = 0; index < response.udns.length; index += 1) {
                    sessionAttributes.udns.push(response.udns[index]);
                }
                handlerInput.requestEnvelope.request.intent.confirmationStatus = 'DENIED';
                const updatedIntent = handlerInput.requestEnvelope.request.intent;
                return handlerInput.responseBuilder.
                    addDelegateDirective(updatedIntent).
                    getResponse();
            } catch (error) {
                return handlerInput.responseBuilder.
                    speak('I had a problem talking to the gateway. The Alexa App will show you more.').
                    withSimpleCard('LG webOS TV Gateway Communication Error', `${error.name}: ${error.message}`).
                    getResponse();
            }
        } else if (handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS') {
            if (
                sessionAttributes.udn.confirmationStatus === 'NONE' &&
                handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED'
            ) {
                if (sessionAttributes.udns.length > 0) {
                    sessionAttributes.udn.confirmationStatus = 'NONE';
                    handlerInput.requestEnvelope.request.intent.confirmationStatus = 'DENIED';
                    sessionAttributes.udn.value = sessionAttributes.udns.shift();
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    return handlerInput.responseBuilder.
                        speak('Did you see the message on your T.V. screen?').
                        addConfirmIntentDirective().
                        getResponse();
                }
                return handlerInput.responseBuilder.
                    speak('That was the last L.G. web O.S. T.V. I found.').
                    getResponse();
            } else if (
                sessionAttributes.udn.confirmationStatus === 'NONE' &&
                handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED'
            ) {
                sessionAttributes.udn.confirmationStatus = 'DENIED';
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (
                sessionAttributes.udn.confirmationStatus === 'NONE' &&
                handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED'
            ) {
                sessionAttributes.udn.confirmationStatus = 'CONFIRMED';
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            }
            return handlerInput.responseBuilder.
                addDelegateDirective().
                getResponse();
        } else if (handlerInput.requestEnvelope.request.dialogState === 'COMPLETED') {
            if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED') {
                Reflect.deleteProperty(persistentAttributes.tvmap, handlerInput.requestEnvelope.context.System.device.deviceId);
                handlerInput.attributesManager.setSessionAttributes();
                return handlerInput.responseBuilder.
                    speak('We failed.').
                    getResponse();
            } else if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED') {
                persistentAttributes.tvmap[handlerInput.requestEnvelope.context.System.device.deviceId] = sessionAttributes.udn.value;
                handlerInput.attributesManager.setSessionAttributes();
                return handlerInput.responseBuilder.
                    speak('We succeeded.').
                    getResponse();
            }
        }
        return handlerInput.responseBuilder.
            addDelegateDirective().
            getResponse();
    }
};

const handlers = [RequestHandler];

module.exports = {'handlers': handlers};
