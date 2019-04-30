// eslint-disable-next-line @typescript-eslint/no-var-requires
const certnames = require("certnames");
import ASK from "ask-sdk";
import ASKModel from "ask-sdk-model";
import {Gateway} from "../gateway-api";
import {constants} from "../../../common/constants";
import crypto from "crypto";
import tls from "tls";

const SetHostnameIntentHandler = {
    canHandle(handlerInput: ASK.HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
               handlerInput.requestEnvelope.request.intent.name === "Authorization_SetHostnameIntent";
    },
    async handle(handlerInput: ASK.HandlerInput): Promise<ASKModel.Response> {
        function getHostnames(ipAddress: string, ipPort: number): Promise<string[]> {
            return new Promise((resolve, reject): void => {
                const sock = tls.connect(ipPort, ipAddress, {"rejectUnauthorized": false});
                sock.on("secureConnect", (): void => {
                    const cert = sock.getPeerCertificate().raw;
                    sock.on("close", (): void => {
                        const hostnames = certnames.getCommonNames(cert);
                        return resolve(hostnames);
                    });
                    sock.end();
                });
                sock.on("error", (error): void => reject(error));
            });
        }

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (typeof handlerInput.requestEnvelope.request === "undefined") {
            throw new Error("invalid code path");
        }
        const intentRequest = (handlerInput.requestEnvelope.request as ASKModel.IntentRequest);
        if (typeof intentRequest.intent.slots === "undefined") {
            throw new Error("invalid code path");
        }
        const slots = (intentRequest.intent.slots as {[x: string]: ASKModel.Slot});
        if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).dialogState === "STARTED") {
            Reflect.deleteProperty(sessionAttributes, "ipAddress");
            Reflect.deleteProperty(sessionAttributes, "hostnames");
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

            return handlerInput.responseBuilder.
                addDelegateDirective().
                getResponse();
        } else if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).dialogState === "IN_PROGRESS") {
            if (typeof slots.ipAddressA.value === "undefined") {
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (parseInt(slots.ipAddressA.value, 10) < 0 || parseInt(slots.ipAddressA.value, 10) > 255) {
                return handlerInput.responseBuilder.
                    speak("I think I misheard you." +
                        " I.P. v four address numbers need to be betwen 0 and 255." +
                        " Could you tell me the first number again?").
                    addElicitSlotDirective("ipAddressA").
                    getResponse();
            } else if (typeof slots.ipAddressB.value === "undefined") {
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (parseInt(slots.ipAddressB.value, 10) < 0 || parseInt(slots.ipAddressB.value, 10) > 255) {
                return handlerInput.responseBuilder.
                    speak("I think I misheard you." +
                        " I.P. v four address numbers need to be betwen 0 and 255." +
                        " Could you tell me the second number again?").
                    addElicitSlotDirective("ipAddressB").
                    getResponse();
            } else if (typeof slots.ipAddressC.value === "undefined") {
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (parseInt(slots.ipAddressC.value, 10) < 0 || parseInt(slots.ipAddressC.value, 10) > 255) {
                return handlerInput.responseBuilder.
                    speak("I think I misheard you." +
                        " I.P. v four address numbers need to be betwen 0 and 255." +
                        " Could you tell me the third number again?").
                    addElicitSlotDirective("ipAddressC").
                    getResponse();
            } else if (typeof slots.ipAddressD.value === "undefined") {
                return handlerInput.responseBuilder.
                    addDelegateDirective().
                    getResponse();
            } else if (parseInt(slots.ipAddressD.value, 10) < 0 || parseInt(slots.ipAddressD.value, 10) > 255) {
                return handlerInput.responseBuilder.
                    speak("I think I misheard you." +
                        " I.P. v four address numbers need to be betwen 0 and 255." +
                        " Could you tell me the fourth number again?").
                    addElicitSlotDirective("ipAddressD").
                    getResponse();
            } else if (typeof slots.hostnameIndex.value === "undefined") {
                sessionAttributes.ipAddress =
                    `${slots.ipAddressA.value}.` +
                    `${slots.ipAddressB.value}.` +
                    `${slots.ipAddressC.value}.` +
                    `${slots.ipAddressD.value}`;
                Reflect.deleteProperty(sessionAttributes, "hostnames");
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                try {
                    sessionAttributes.hostnames = await getHostnames(sessionAttributes.ipAddress, 25392);
                } catch (error) {
                    return handlerInput.responseBuilder.
                        speak("I had a problem connecting to the I.P. address." +
                            " A card in the Alexa App shows more.").
                        withSimpleCard("LG webOS TV Controller Error", `${error.name}: ${error.message}`).
                        getResponse();
                }
                const cardTitle = "Gateway Hostname Configuration";
                let cardContent = "";
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
                    speak("Thank you." +
                        " Now, could you look at the card in your Alexa app and" +
                        " tell me the number next to your gateway's hostname?").
                    withSimpleCard(cardTitle, cardContent).
                    addElicitSlotDirective("hostnameIndex").
                    getResponse();
            } else if ((slots.hostnameIndex.value >= sessionAttributes.hostnames.length + 2) ||
                       (((slots.hostnameIndex.value as unknown) as number) < 0)) {
                return handlerInput.responseBuilder.
                    speak("I think I misheard you." +
                        ` I heard ${slots.hostnameIndex.value}, which is not an index on the card.` +
                        " Could you repeat your index?").
                    addElicitSlotDirective("hostnameIndex").
                    getResponse();
            } else if (slots.hostnameIndex.value === sessionAttributes.hostnames.length + 1) {
                return handlerInput.responseBuilder.
                    speak("I'm sorry I misheard your gateway's I.P. address." +
                        "Maybe we could try again.").
                    getResponse();
            } else if (slots.hostnameIndex.value === sessionAttributes.hostnames.length) {
                return handlerInput.responseBuilder.
                    speak("I'm sorry I could not discover your gateway's hostname.").
                    getResponse();
            } else if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).intent.confirmationStatus === "NONE") {
                return handlerInput.responseBuilder.
                    speak(`Is your hostname ${sessionAttributes.hostnames[slots.hostnameIndex.value]}?`).
                    addConfirmIntentDirective().
                    getResponse();
            }
        } else if (intentRequest.dialogState === "COMPLETED") {
            if (intentRequest.intent.confirmationStatus === "CONFIRMED") {
                let persistentAttributes: {
                    hostname?: string;
                } = {};
                try {
                    persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
                } catch (error) {
                    return handlerInput.responseBuilder.
                        speak("I had a problem and we will have to start over." +
                            " A card in the Alexa app shows more.").
                        withSimpleCard("Error", `${error.name}: ${error.message}`).
                        getResponse();
                }
                Reflect.deleteProperty(persistentAttributes, "hostname");
                Reflect.deleteProperty(persistentAttributes, "password");
                Reflect.deleteProperty(persistentAttributes, "tvmap");
                persistentAttributes.hostname = sessionAttributes.hostnames[slots.hostnameIndex.value as string];
                try {
                    await handlerInput.attributesManager.savePersistentAttributes();
                } catch (error) {
                    return handlerInput.responseBuilder.
                        speak("I had a problem and we will have to start over." +
                            " A card in the Alexa app shows more.").
                        withSimpleCard("Error", `${error.name}: ${error.message}`).
                        getResponse();
                }
                Reflect.deleteProperty(sessionAttributes, "ipAddress");
                Reflect.deleteProperty(sessionAttributes, "hostnames");
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder.
                    speak("Your gateway's hostname has been set.").
                    getResponse();
            } else if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).intent.confirmationStatus === "DENIED") {
                Reflect.deleteProperty(sessionAttributes, "ipAddress");
                Reflect.deleteProperty(sessionAttributes, "hostnames");
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder.
                    speak("Your gateway's hostname has not been set.").
                    getResponse();
            }
            return handlerInput.responseBuilder.
                addDelegateDirective().
                getResponse();
        }
        return handlerInput.responseBuilder.
            addDelegateDirective().
            getResponse();
    }
};
const SetPasswordIntentHandler = {
    canHandle(handlerInput: ASK.HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "Authorization_SetPasswordIntent";
    },
    async handle(handlerInput: ASK.HandlerInput): Promise<ASKModel.Response> {
        let persistentAttributes: {
            hostname?: string;
            password?: string;
        } = {};
        try {
            persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        } catch (error) {
            throw error;
        }
        if (typeof persistentAttributes.hostname === "undefined") {
            return handlerInput.responseBuilder.
                speak("You need to set your gateway's hostname before you can set its password.").
                getResponse();
        }
        const password = crypto.randomBytes(64).toString("hex");
        try {
            try {
                const options = {
                    "hostname": persistentAttributes.hostname,
                    "path": "/HTTP",
                    "username": "HTTP",
                    "password": constants.gatewayRootPassword
                };
                const request = {
                    "command": {
                        "name": "passwordSet",
                        "value": password
                    }
                };
                const gateway = new Gateway("");
                await gateway.send(options, request);
            } catch (error) {
                return handlerInput.responseBuilder.
                    speak("I had a problem talking with the gateway. The Alexa app will show you more.").
                    withSimpleCard("Gateway Communication Error", `${error.name}; ${error.message}`).
                    getResponse();
            }
            persistentAttributes.password = password;
            Reflect.deleteProperty(persistentAttributes, "tvmap");
            handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
            try {
                await handlerInput.attributesManager.savePersistentAttributes();
            } catch (error) {
                return handlerInput.responseBuilder.
                    speak("I had a problem and we will have to start over." +
                        " A card in the Alexa App shows more.").
                    withSimpleCard("Error", `${error.name}: ${error.message}`).
                    getResponse();
            }
            return handlerInput.responseBuilder.
                speak("Your password has been set.").
                getResponse();
        } catch (error) {
            return handlerInput.responseBuilder.
                speak("I had a problem talking to the gateway. The Alexa App will show you more.").
                withSimpleCard("Error", `${error.name}: ${error.message}`).
                getResponse();
        }
    }
};

const handlers = [
    SetHostnameIntentHandler,
    SetPasswordIntentHandler
];

export {handlers};