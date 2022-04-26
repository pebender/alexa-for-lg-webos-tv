import * as ASKModel from "ask-sdk-model";
import { HandlerInput as ASKHandlerInput } from "ask-sdk-core/dist/dispatcher/request/handler/HandlerInput";
import { SkillBuilders as ASKSkillBuilders } from "ask-sdk-core/dist/skill/SkillBuilders.js";
import * as ASKRequestEnvelope from "ask-sdk-core/dist/util/RequestEnvelopeUtils";
import * as Common from "../../../common";
import * as LGTVSetHostname from "./lgtv-configure-bridge";

const LaunchRequestHandler = {
  canHandle(handlerInput: ASKHandlerInput): boolean {
    return (
      ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) ===
      "LaunchRequest"
    );
  },
  handle(handlerInput: ASKHandlerInput): ASKModel.Response {
    const speechOutput = "Ground control to major Tom.";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput: ASKHandlerInput): boolean {
    return (
      ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) ===
        "IntentRequest" &&
      ASKRequestEnvelope.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput: ASKHandlerInput): ASKModel.Response {
    const speechOutput = "There is a manual around here somewhere.";
    const response: ASKModel.Response = handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
    Common.Debug.debug(JSON.stringify(response));
    return response;
  },
};

const CancelIntentHandler = {
  canHandle(handlerInput: ASKHandlerInput): boolean {
    return (
      ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) ===
        "IntentRequest" &&
      ASKRequestEnvelope.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent"
    );
  },
  handle(handlerInput: ASKHandlerInput): ASKModel.Response {
    const speechOutput = "There is a big red button around here somewhere.";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const StopIntentHandler = {
  canHandle(handlerInput: ASKHandlerInput): boolean {
    return (
      ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) ===
        "IntentRequest" &&
      ASKRequestEnvelope.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.StopIntent"
    );
  },
  handle(handlerInput: ASKHandlerInput): ASKModel.Response {
    const speechOutput = "But I don't want to stop.";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput: ASKHandlerInput): boolean {
    return (
      ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) ===
        "IntentRequest" &&
      ASKRequestEnvelope.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput: ASKHandlerInput): ASKModel.Response {
    const speechOutput = "It's time to fall back.";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput: ASKHandlerInput): boolean {
    return (
      ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  async handle(handlerInput: ASKHandlerInput): Promise<ASKModel.Response> {
    return handlerInput.responseBuilder.getResponse();
  },
};

const handlers = [
  LaunchRequestHandler,
  ...LGTVSetHostname.handlers,
  HelpIntentHandler,
  CancelIntentHandler,
  StopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler,
];

const ErrorHandler = {
  canHandle(): boolean {
    return true;
  },
  handle(handlerInput: ASKHandlerInput, error: Error): ASKModel.Response {
    const speechOutput =
      "Sorry, I can't understand the command. Please say again.";
    Common.Debug.debugError(error);
    Common.Debug.debugJSON(handlerInput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

// Function has three arguments skillHandler(event, context, callback).
const skillHandler = async function (
  request: ASKModel.RequestEnvelope,
  context: ASKModel.Context
): Promise<ASKModel.ResponseEnvelope> {
  return ASKSkillBuilders.custom()
    .addRequestHandlers(...handlers)
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent(Common.constants.application.name.safe)
    .create()
    .invoke(request, context);
};

export { skillHandler as handler };
