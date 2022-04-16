import * as ASH from '../../../common/alexa'
import * as AWSLambda from 'aws-lambda'
import * as alexaAuthorization from './authorization'
import * as alexaDiscovery from './discovery'
import * as Bridge from '../bridge-api'

async function remoteResponse (alexaRequest: ASH.Request): Promise<ASH.Response> {
  return await Bridge.sendSkillDirective(alexaRequest)
}

// eslint-disable-next-line no-unused-vars
async function handlerWithoutLogging (alexaRequest: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
  if (typeof alexaRequest.directive.endpoint === 'undefined' ||
        typeof alexaRequest.directive.endpoint.endpointId === 'undefined') {
    switch (alexaRequest.directive.header.namespace) {
      case 'Alexa.Authorization':
        return alexaAuthorization.handler(alexaRequest)
      case 'Alexa.Discovery':
        return alexaDiscovery.handler(alexaRequest)
      default:
        throw ASH.errorResponseForInvalidDirectiveNamespace(alexaRequest)
    }
  } else {
    return remoteResponse(alexaRequest)
  }
}

// eslint-disable-next-line no-unused-vars
async function handlerWithLogging (alexaRequest: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
  try {
    await Bridge.sendLogMessage(alexaRequest, alexaRequest)
  } catch (error) {
    //
  }

  try {
    const alexaResponse = await handlerWithoutLogging(alexaRequest, context)
    try {
      await Bridge.sendLogMessage(alexaRequest, alexaResponse)
    } catch (error) {
      //
    }
    return alexaResponse
  } catch (error) {
    const alexaResponse = (error as ASH.AlexaError).response
    try {
      await Bridge.sendLogMessage(alexaRequest, alexaResponse)
    } catch (error) {
      //
    }
    throw error
  }
}

async function handler (event: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
  const alexaRequest = new ASH.Request(event)

  // return await handlerWithoutLogging(alexaRequest, context)
  return await handlerWithLogging(alexaRequest, context)
}

export { handler }
