const crypto = require('crypto');
const {constants} = require('alexa-lg-webos-tv-core');
const httpPost = require('./http-post.js');

const HTTPHostnameSetIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'HTTPHostnameSetIntent';
    },
    async handle(handlerInput) {
        let persistentAttributes = {};
        try {
            persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        } catch (error) {
            throw error;
        }
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (handlerInput.requestEnvelope.request.dialogState === 'STARTED') {
            persistentAttributes.hostname = '';
            persistentAttributes.password = '';
            persistentAttributes.tvmap = [];
            try {
                await handlerInput.attributesManager.savePersistentAttributes();
            } catch (error) {
                throw error;
            }
            handlerInput.responseBuilder.
                addDelegateDirective().
                getResponse();
        } else if (handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS') {
            const ipAddressA = handlerInput.requestEnvelope.request.intent.slots.ipAddressA.value;
            const ipAddressB = handlerInput.requestEnvelope.request.intent.slots.ipAddressB.value;
            const ipAddressC = handlerInput.requestEnvelope.request.intent.slots.ipAddressC.value;
            const ipAddressD = handlerInput.requestEnvelope.request.intent.slots.ipAddressD.value;
            if (!ipAddressA) {
                handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (ipAddressA && (ipAddressA < 0 || ipAddressA > 255)) {
                handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be betwen 0 and 255.' +
                        ' Could you tell me the first number again?').
                    addElicitSlotDirective('ipAddressA').
                    getResponse();
            } else if (!ipAddressB) {
                handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (ipAddressB && (ipAddressB < 0 || ipAddressB > 255)) {
                handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be betwen 0 and 255.' +
                        ' Could you tell me the second number again?').
                    addElicitSlotDirective('ipAddressB').
                    getResponse();
            } else if (!ipAddressC) {
                handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (ipAddressC && (ipAddressC < 0 || ipAddressC > 255)) {
                handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be betwen 0 and 255.' +
                        ' Could you tell me the third number again?').
                    addElicitSlotDirective('ipAddressC').
                    getResponse();
            } else if (!ipAddressD) {
                handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (ipAddressD && (ipAddressD < 0 || ipAddressD > 255)) {
                handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be betwen 0 and 255.' +
                        ' Could you tell me the fourth number again?').
                    addElicitSlotDirective('ipAddressD');
            } else if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'NONE') {
                const options = {
                    'hostname': `${ipAddressA}.${ipAddressB}.${ipAddressC}.${ipAddressD}`,
                    'path': '/HTTP',
                    'username': 'HTTP',
                    'password': constants.password,
                    'rejectUnauthorized': false
                };
                const request = {'command': {'name': 'hostnameGet'}};
                httpPost.post(options, request, (error, response) => {
                    if (error) {
                        handlerInput.responseBuilder.
                            speak(error.message).
                            getResponse();
                    } else if (response && Reflect.has(response, 'error')) {
                        handlerInput.responseBuilder.
                            speak(response.error.message).
                            getResponse();
                    } else {
                        const {hostname} = response;
                        handlerInput.responseBuilder.
                            speak(`Is your hostname ${hostname}?`).
                            addConfirmIntentDirective().
                            getResponse();
                    }
                });
            } else {
                handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            }
        } else if (handlerInput.requestEnvelope.request.dialogState === 'COMPLETED') {
            if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED') {
                handlerInput.responseBuilder.
                    speak('We failed.').
                    getResponse();
            } else if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED') {
                persistentAttributes.hostname = sessionAttributes.hostname;
                handlerInput.responseBuilder.
                    speak('We succeeded.').
                    getResponse();
            }
        }
    }
};
const HTTPPasswordSetIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'HTTPPasswordSetIntent';
    },
    async handle(handlerInput) {
        let persistentAttributes = {};
        try {
            persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        } catch (error) {
            throw error;
        }

        const password = crypto.randomBytes(64).toString('hex');
        if (!Reflect.has(persistentAttributes, 'hostname')) {
            handlerInput.responseBuilder.
                speak('You need to set your L.G. web O.S. T.V. gateway hostname before you can set its password.').
                getResponse();
        }
        const options = {
            'hostname': persistentAttributes.hostname,
            'path': '/HTTP',
            'username': 'HTTP',
            'password': constants.password
        };
        const request = {
            'command': {
                'name': 'passwordSet',
                'password': password,
                'deviceId': handlerInput.requestEnvelope.context.System.device.deviceId
            }
        };
        httpPost.post(options, request, (error, response) => {
            if (error) {
                handlerInput.responseBuilder.
                    speak(error.message).
                    getResponse();
            } else if (response && Reflect.has(response, 'error')) {
                handlerInput.responseBuilder.
                    speak(response.error.message).
                    getResponse();
            } else {
                persistentAttributes.password = password;
                handlerInput.responseBuilder.
                    speak('Your password has been set.').
                    getResponse();
            }
        });
    }
};
const LGTVBindHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'LGTVBind';
    },

    async handle(handlerInput) {
        let persistentAttributes = {};
        try {
            persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        } catch (error) {
            throw error;
        }
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (handlerInput.requestEnvelope.request.dialogState === 'STARTED') {
            if (Reflect.has(sessionAttributes, 'udn')) {
                Reflect.deleteProperty(sessionAttributes, 'udn');
            }
            sessionAttributes.udn = {};
            sessionAttributes.udn.configurationStatus = 'NONE';

            if (!Reflect.has(persistentAttributes, 'tvmap')) {
                persistentAttributes.tvmap = [];
                handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
            }
            if (!Reflect.has(persistentAttributes, 'hostname')) {
                handlerInput.responseBuilder.
                    speak('You have not configured the hostname of your L.G. web O.S. T.V. gateway.').
                    getResponse();
            }
            if (!Reflect.has(persistentAttributes, 'password')) {
                handlerInput.responseBuilder.
                    speak('You have not configured the password of your L.G. web O.S. T.V. gateway.').
                    getResponse();
            }
            const options = {
                'hostname': persistentAttributes.hostname,
                'path': '/LGTV/MAP',
                'username': 'LGTV',
                'password': persistentAttributes.password
            };
            const request = {'command': {'name': 'udnsGet'}};
            httpPost.post(options, request, (error, response) => {
                if (error) {
                    handlerInput.responseBuilder.
                        speak(error.message).
                        getResponse();
                } else if (response && Reflect.has(response, 'error')) {
                    handlerInput.responseBuilder.
                        speak(response.error.message).
                        getResponse();
                } else {
                    if (!Reflect.has(response, 'udns')) {
                        handlerInput.responseBuilder.
                            speak('I could not find an L.G. web O.S. T.V.').
                            getResponse();
                    }
                    if (response.udns.length === 0) {
                        handlerInput.responseBuilder.
                            speak('That was the last L.G. web O.S. T.V. I found.').
                            getResponse();
                    }
                    let index = 0;
                    sessionAttributes.udns = [];
                    for (index = 0; index < response.udns.length; index += 1) {
                        sessionAttributes.udns.push(response.udns[index]);
                    }
                    handlerInput.requestEnvelope.request.intent.confirmationStatus = 'DENIED';
                    const updatedIntent = handlerInput.requestEnvelope.request.intent;
                    handlerInput.responseBuilder.
                        addDelegateDirective(updatedIntent).
                        getResponse();
                }
            });
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
                    handlerInput.responseBuilder.
                        speak('Did you see the message on your T.V. screen?').
                        addConfirmIntentDirective().
                        getResponse();
                } else {
                    handlerInput.responseBuilder.
                        speak('That was the last L.G. web O.S. T.V. I found.').
                        getResponse();
                }
            } else if (
                sessionAttributes.udn.confirmationStatus === 'NONE' &&
                handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED'
            ) {
                sessionAttributes.udn.confirmationStatus = 'DENIED';
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (
                sessionAttributes.udn.confirmationStatus === 'NONE' &&
                handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED'
            ) {
                sessionAttributes.udn.confirmationStatus = 'CONFIRMED';
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else {
                handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            }
        } else if (handlerInput.requestEnvelope.request.dialogState === 'COMPLETED') {
            if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED') {
                Reflect.deleteProperty(persistentAttributes.tvmap, handlerInput.requestEnvelope.context.System.device.deviceId);
                handlerInput.attributesManager.setSessionAttributes();
                handlerInput.responseBuilder.
                    speak('We failed.').
                    getResponse();
            } else if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED') {
                persistentAttributes.tvmap[handlerInput.requestEnvelope.context.System.device.deviceId] = sessionAttributes.udn.value;
                handlerInput.attributesManager.setSessionAttributes();
                handlerInput.responseBuilder.
                    speak('We succeeded.').
                    getResponse();
            }
        }
    }
};
const handlers = [
    HTTPHostnameSetIntentHandler,
    HTTPPasswordSetIntentHandler,
    LGTVBindHandler
];
module.exports = {'handlers': handlers};