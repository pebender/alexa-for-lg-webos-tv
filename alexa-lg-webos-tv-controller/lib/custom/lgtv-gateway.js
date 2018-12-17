const tls = require('tls');
const crypto = require('crypto');
const certnames = require('certnames');
const constants = require('alexa-lg-webos-tv-common');
const httpPost = require('../common/http-post.js');

const SetHostnameIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'LGTVGateway_SetHostnameIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {slots} = handlerInput.requestEnvelope.request.intent;
        if (handlerInput.requestEnvelope.request.dialogState === 'STARTED') {
            Reflect.deleteProperty(sessionAttributes, 'ipAddress');
            Reflect.deleteProperty(sessionAttributes, 'hostnames');
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

            return handlerInput.responseBuilder.
                addDelegateDirective().
                getResponse();
        } else if (handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS') {
            if (!Reflect.has(slots.ipAddressA, 'value')) {
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (slots.ipAddressA.value < 0 || slots.ipAddressA.value > 255) {
                return handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be betwen 0 and 255.' +
                        ' Could you tell me the first number again?').
                    addElicitSlotDirective('ipAddressA').
                    getResponse();
            } else if (!Reflect.has(slots.ipAddressB, 'value')) {
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (slots.ipAddressB.value < 0 || slots.ipAddressB.value > 255) {
                return handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be betwen 0 and 255.' +
                        ' Could you tell me the second number again?').
                    addElicitSlotDirective('ipAddressB').
                    getResponse();
            } else if (!Reflect.has(slots.ipAddressC, 'value')) {
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (slots.ipAddressC.value < 0 || slots.ipAddressC.value > 255) {
                return handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be betwen 0 and 255.' +
                        ' Could you tell me the third number again?').
                    addElicitSlotDirective('ipAddressC').
                    getResponse();
            } else if (!Reflect.has(slots.ipAddressD, 'value')) {
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (slots.ipAddressD.value < 0 || slots.ipAddressD.value > 255) {
                return handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be betwen 0 and 255.' +
                        ' Could you tell me the fourth number again?').
                    addElicitSlotDirective('ipAddressD').
                    getResponse();
            } else if (!Reflect.has(slots.hostnameIndex, 'value')) {
                sessionAttributes.ipAddress =
                    `${slots.ipAddressA.value}.` +
                    `${slots.ipAddressB.value}.` +
                    `${slots.ipAddressC.value}.` +
                    `${slots.ipAddressD.value}`;
                Reflect.deleteProperty(sessionAttributes, 'hostnames');
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                try {
                    sessionAttributes.hostnames = await getHostnames(sessionAttributes.ipAddress, 25392);
                } catch (error) {
                    return handlerInput.responseBuilder.
                        speak('I had a problem connecting to the I.P. address.' +
                            ' A card in the Alexa App shows more.').
                        withSimpleCard('LG webOS TV Controller Error', `${error.name}: ${error.message}`).
                        getResponse();
                }
                const cardTitle = 'Gateway Hostname Configuration';
                let cardContent = '';
                let index = 0;
                while (index < sessionAttributes.hostnames.length) {
                    cardContent += `${index}: ${sessionAttributes.hostnames[index]}\n`;
                    index += 1;
                }
                cardContent += `\n${index}: My gateway is not in the list of hostnames.`;
                index += 1;
                cardContent += `\n${index}: My IP address is not '${sessionAttributes.ipAddress}'.`;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder.
                    speak('Thank you.' +
                        ' Now, could you look at the card in your Alexa app and' +
                        ' tell me the number next to your gateway\'s hostname?').
                    withSimpleCard(cardTitle, cardContent).
                    addElicitSlotDirective('hostnameIndex').
                    getResponse();
            } else if ((slots.hostnameIndex.value >= sessionAttributes.hostnames.length + 2) ||
                       (slots.hostnameIndex.value < 0)) {
                return handlerInput.responseBuilder.
                    speak('I think I misheard you.' +
                        ` I heard ${slots.hostnameIndex.value}, which is not an index on the card.` +
                        ' Could you repeat your index?').
                    addElicitSlotDirective('hostnameIndex').
                    getResponse();
            } else if (slots.hostnameIndex.value === sessionAttributes.hostnames.length + 1) {
                return handlerInput.responseBuilder.
                    speak('I\'m sorry I misheard your gateway\'s I.P. address.' +
                        'Maybe we could try again.').
                    getResponse();
            } else if (slots.hostnameIndex.value === sessionAttributes.hostnames.length) {
                return handlerInput.responseBuilder.
                    speak('I\'m sorry I could not discover your gateway\'s hostname.').
                    getResponse();
            } else if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'NONE') {
                return handlerInput.responseBuilder.
                    speak(`Is your hostname ${sessionAttributes.hostnames[slots.hostnameIndex.value]}?`).
                    addConfirmIntentDirective().
                    getResponse();
            }
        } else if (handlerInput.requestEnvelope.request.dialogState === 'COMPLETED') {
            if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED') {
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
                Reflect.deleteProperty(persistentAttributes, 'hostname');
                Reflect.deleteProperty(persistentAttributes, 'password');
                Reflect.deleteProperty(persistentAttributes, 'tvmap');
                persistentAttributes.hostname = sessionAttributes.hostnames[slots.hostnameIndex.value];
                try {
                    await handlerInput.attributesManager.savePersistentAttributes();
                } catch (error) {
                    return handlerInput.responseBuilder.
                        speak('I had a problem and we will have to start over.' +
                            ' A card in the Alexa app shows more.').
                        withSimpleCard('Error', `${error.name}: ${error.message}`).
                        getResponse();
                }
                Reflect.deleteProperty(sessionAttributes, 'ipAddress');
                Reflect.deleteProperty(sessionAttributes, 'hostnames');
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder.
                    speak('Your gateway\'s hostname has been set.').
                    getResponse();
            } else if (handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED') {
                Reflect.deleteProperty(sessionAttributes, 'ipAddress');
                Reflect.deleteProperty(sessionAttributes, 'hostnames');
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder.
                    speak('Your gateway\'s hostname has not been set.').
                    getResponse();
            }
            return handlerInput.responseBuilder.
                addDelegateDirective().
                getResponse();
        }
        return handlerInput.responseBuilder.
            addDelegateDirective().
            getResponse();

        function getHostnames(ipAddress, ipPort) {
            return new Promise((resolve, reject) => {
                const sock = tls.connect(ipPort, ipAddress, {'rejectUnauthorized': false});
                sock.on('secureConnect', () => {
                    const cert = sock.getPeerCertificate().raw;
                    sock.on('close', () => {
                        const hostnames = certnames.getCommonNames(cert);
                        return resolve(hostnames);
                    });
                    sock.end();
                });
                sock.on('error', (error) => reject(error));
            });
        }
    }
};
const SetPasswordIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'LGTVGateway_SetPasswordIntent';
    },
    async handle(handlerInput) {
        let persistentAttributes = {};
        try {
            persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        } catch (error) {
            throw error;
        }
        if (!Reflect.has(persistentAttributes, 'hostname')) {
            return handlerInput.responseBuilder.
                speak('You need to set your gateway\'s hostname before you can set its password.').
                getResponse();
        }
        const password = crypto.randomBytes(64).toString('hex');
        try {
            try {
                const options = {
                    'hostname': persistentAttributes.hostname,
                    'path': '/HTTP',
                    'username': 'HTTP',
                    'password': constants.password
                };
                const request = {
                    'command': {
                        'name': 'passwordSet',
                        'value': password
                    }
                };
                await httpPost.post(options, request);
            } catch (error) {
                return handlerInput.responseBuilder.
                    speak('I had a problem talking with the gateway. The Alexa app will show you more.').
                    withSimpleCard('Gateway Communication Error', `${error.name}; ${error.message}`).
                    getResponse();
            }
            persistentAttributes.password = password;
            Reflect.deleteProperty(persistentAttributes, 'tvmap');
            handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
            try {
                await handlerInput.attributesManager.savePersistentAttributes();
            } catch (error) {
                return handlerInput.responseBuilder.
                    speak('I had a problem and we will have to start over.' +
                        ' A card in the Alexa App shows more.').
                    withSimpleCard('Error', `${error.name}: ${error.message}`).
                    getResponse();
            }
            return handlerInput.responseBuilder.
                speak('Your password has been set.').
                getResponse();
        } catch (error) {
            return handlerInput.responseBuilder.
                speak('I had a problem talking to the gateway. The Alexa App will show you more.').
                withSimpleCard('Error', `${error.name}: ${error.message}`).
                getResponse();
        }
    }
};

const handlers = [
    SetHostnameIntentHandler,
    SetPasswordIntentHandler
];

module.exports = {'handlers': handlers};