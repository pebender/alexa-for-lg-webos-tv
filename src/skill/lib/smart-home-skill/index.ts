import * as AWSLambda from 'aws-lambda'
import * as Common from '../../../common'
import * as alexaAuthorization from './authorization'
import * as alexaDiscovery from './discovery'
import * as Bridge from './bridge-api'

async function handlerWithErrors (alexaRequest: Common.SHS.AlexaRequest, context: AWSLambda.Context): Promise<Common.SHS.AlexaResponse> {
  if (typeof alexaRequest.directive.endpoint === 'undefined' ||
        typeof alexaRequest.directive.endpoint.endpointId === 'undefined') {
    switch (alexaRequest.directive.header.namespace) {
      case 'Alexa.Authorization':
        return alexaAuthorization.handler(alexaRequest)
      case 'Alexa.Discovery':
        return alexaDiscovery.handler(alexaRequest)
      default:
        throw Common.SHS.errorResponseForInvalidDirectiveNamespace(alexaRequest)
    }
  } else {
    return await Bridge.sendSkillDirective(alexaRequest)
  }
}

async function handler (event: Common.SHS.AlexaRequest, context: AWSLambda.Context): Promise<Common.SHS.AlexaResponse> {
  const alexaRequest = new Common.SHS.AlexaRequest(event)

  Common.Debug.debug('smart home skill request message')
  Common.Debug.debug(JSON.stringify(alexaRequest, null, 2))

  let alexaResponse: Common.SHS.AlexaResponse

  try {
    alexaResponse = await handlerWithErrors(alexaRequest, context)
    Common.Debug.debug('smart home skill response message')
    Common.Debug.debug(JSON.stringify(alexaResponse, null, 2))
  } catch (error) {
    let alexaError: Common.SHS.AlexaError
    if (error instanceof Common.SHS.AlexaError) {
      alexaError = error
    } else {
      alexaError = Common.SHS.errorResponseFromError(alexaRequest, error)
    }
    alexaResponse = alexaError.response
    Common.Debug.debug('smart home skill error response message')
    Common.Debug.debug(JSON.stringify(alexaResponse, null, 2))
    Common.Debug.debug('smart home skill stack trace')
    if (typeof alexaError.stack !== 'undefined') {
      Common.Debug.debug(alexaError.stack)
    }
  }

  return alexaResponse
}

export { handler }
