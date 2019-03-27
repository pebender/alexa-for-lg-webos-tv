import * as Alexa from "ask-sdk";
import * as authorization from "./authorization";
import {DynamoDbPersistenceAdapter} from "ask-sdk-dynamodb-persistence-adapter";

const persistenceAdapter = new DynamoDbPersistenceAdapter({
    "tableName": "LGwebOSTVController",
    "createTable": true
});

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent";
    },
    handle(handlerInput) {
        const speechText = "There is a manual around here somewhere.";
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};
const CancelIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent";
    },
    handle(handlerInput) {
        const speechText = "There is a big red button around here somewhere.";
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};

const StopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.StopIntent";
    },
    handle(handlerInput) {
        const speechText = "But I don't want to stop.";
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
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
    ...authorization.handlers,
    HelpIntentHandler,
    CancelIntentHandler,
    StopIntentHandler,
    SessionEndedRequestHandler
];

const ErrorHandler = {
    canHandle() {
        return true;
    },
    // eslint-disable-next-line no-unused-vars
    handle(handlerInput, _error) {
        return handlerInput.responseBuilder.
            speak("Sorry, I can't understand the command. Please say again.").
            reprompt("Sorry, I can't understand the command. Please say again.").
            getResponse();
    }
};

// Function has three arguments skillHandler(event, context, callback).
const skillHandler = Alexa.SkillBuilders.custom().
    addRequestHandlers(...handlers).
    addErrorHandlers(ErrorHandler).
    withPersistenceAdapter(persistenceAdapter).
    lambda();

module.exports = {"handler": skillHandler};