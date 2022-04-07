import * as ASKCore from 'ask-sdk-core'
import * as ASKModel from 'ask-sdk-model'
import * as authorization from './authorization'
import { DynamoDbPersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter'

const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: 'ForLGwebOSTV',
  createTable: true
})

const LaunchRequestHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speakText = 'Ground control to major Tom.'
    return handlerInput.responseBuilder
      .speak(speakText)
      .reprompt(speakText)
      .getResponse()
  }
}

const HelpIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speakText = 'There is a manual around here somewhere.'
    return handlerInput.responseBuilder
      .speak(speakText)
      .reprompt(speakText)
      .getResponse()
  }
}

const CancelIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speakText = 'There is a big red button around here somewhere.'
    return handlerInput.responseBuilder
      .speak(speakText)
      .reprompt(speakText)
      .getResponse()
  }
}

const StopIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speakText = 'But I don\'t want to stop.'
    return handlerInput.responseBuilder.speak(speakText).getResponse()
  }
}

const FallbackIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speakText = 'It\'s time to fall back.'
    return handlerInput.responseBuilder.speak(speakText).getResponse()
  }
}

const SessionEndedRequestHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest'
  },
  async handle (handlerInput: ASKCore.HandlerInput): Promise<ASKModel.Response> {
    await handlerInput.attributesManager.savePersistentAttributes()
    return handlerInput.responseBuilder.getResponse()
  }
}

const handlers = [
  LaunchRequestHandler,
  ...authorization.handlers,
  HelpIntentHandler,
  CancelIntentHandler,
  StopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler
]

const ErrorHandler = {
  canHandle (): boolean {
    return true
  },
  handle (handlerInput: ASKCore.HandlerInput, error: Error): ASKModel.Response {
    const speakText = 'Sorry, I can\'t understand the command. Please say again.'
    return handlerInput.responseBuilder
      .speak(speakText)
      .reprompt(speakText)
      .getResponse()
  }
}

// Function has three arguments skillHandler(event, context, callback).
const skillHandler = async function (request: ASKModel.RequestEnvelope, context: ASKModel.Context): Promise<ASKModel.ResponseEnvelope> {
  return ASKCore.SkillBuilders.custom()
    .addRequestHandlers(...handlers)
    .addErrorHandlers(ErrorHandler)
    .withPersistenceAdapter(persistenceAdapter)
    .withCustomUserAgent('For LG webOS TV')
    .create()
    .invoke(request, context)
}

export { skillHandler as handler }
