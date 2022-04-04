import * as ASKCore from 'ask-sdk-core'
import * as ASKModel from 'ask-sdk-model'
import * as authorization from './authorization'
import { DynamoDbPersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter'

const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: 'LGWebOSTVController',
  createTable: true
})

const LaunchRequestHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speechOutput = 'Ground control to major Tom.'
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse()
  }
}

const HelpIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speechOutput = 'There is a manual around here somewhere.'
    const response: ASKModel.Response = handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse()
    console.log(JSON.stringify(response))
    return response
  }
}

const CancelIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speechOutput = 'There is a big red button around here somewhere.'
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse()
  }
}

const StopIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speechOutput = 'But I don\'t want to stop.'
    return handlerInput.responseBuilder.speak(speechOutput).getResponse()
  }
}

const FallbackIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
  },
  handle (handlerInput: ASKCore.HandlerInput): ASKModel.Response {
    const speechOutput = 'It\'s time to fall back.'
    return handlerInput.responseBuilder.speak(speechOutput).getResponse()
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
    const speechOutput = 'Sorry, I can\'t understand the command. Please say again.'
    console.log(`~~~~ Error handled: ${error.name} - ${error.message}: ${JSON.stringify(handlerInput)}`)
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse()
  }
}

// Function has three arguments skillHandler(event, context, callback).
const skillHandler = ASKCore.SkillBuilders.custom()
  .addRequestHandlers(...handlers)
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(persistenceAdapter)
  .withCustomUserAgent('LGWebOSTVController')
  .lambda()

export class CustomSkill {
  // eslint-disable-next-line class-methods-use-this
  public handler (requestEnvelope: ASKModel.RequestEnvelope, context: ASKModel.Context, callback: (err: Error, responseEnvelope?: ASKModel.ResponseEnvelope) => void): void {
    return skillHandler(requestEnvelope, context, callback)
  }
}

export { skillHandler as handler }
