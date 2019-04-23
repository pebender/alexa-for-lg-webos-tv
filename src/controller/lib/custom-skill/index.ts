import * as ASK from "ask-sdk";
import * as ASKModel from "ask-sdk-model";
import * as authorization from "./authorization";
import {DynamoDbPersistenceAdapter} from "ask-sdk-dynamodb-persistence-adapter";

const persistenceAdapter = new DynamoDbPersistenceAdapter({
    "tableName": "LGwebOSTVController",
    "createTable": true
});

const HelpIntentHandler = {
    canHandle(handlerInput: ASK.HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent";
    },
    handle(handlerInput: ASK.HandlerInput): ASKModel.Response {
        const speechText = "There is a manual around here somewhere.";
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};
const CancelIntentHandler = {
    canHandle(handlerInput: ASK.HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent";
    },
    handle(handlerInput: ASK.HandlerInput): ASKModel.Response {
        const speechText = "There is a big red button around here somewhere.";
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};

const StopIntentHandler = {
    canHandle(handlerInput: ASK.HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.StopIntent";
    },
    handle(handlerInput: ASK.HandlerInput): ASKModel.Response {
        const speechText = "But I don't want to stop.";
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput: ASK.HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
    },
    async handle(handlerInput: ASK.HandlerInput): Promise<ASKModel.Response> {
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
    canHandle(): boolean {
        return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handle(handlerInput: ASK.HandlerInput, _error: Error): ASKModel.Response {
        return handlerInput.responseBuilder.
            speak("Sorry, I can't understand the command. Please say again.").
            reprompt("Sorry, I can't understand the command. Please say again.").
            getResponse();
    }
};

// Function has three arguments skillHandler(event, context, callback).
const skillHandler = ASK.SkillBuilders.custom().
    addRequestHandlers(...handlers).
    addErrorHandlers(ErrorHandler).
    withPersistenceAdapter(persistenceAdapter).
    lambda();

export class CustomSkill {
    // eslint-disable-next-line class-methods-use-this
    public handler(requestEnvelope: ASKModel.RequestEnvelope, context: ASKModel.Context, callback: (err: Error, responseEnvelope?: ASKModel.ResponseEnvelope) => void): void {
        return skillHandler(requestEnvelope, context, callback);
    }
}

export {skillHandler as handler};