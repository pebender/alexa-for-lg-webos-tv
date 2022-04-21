import * as AWSLambda from 'aws-lambda'
import * as Common from '../../../common'
import * as alexaAuthorization from './authorization'
import * as alexaDiscovery from './discovery'
import * as Bridge from './bridge-api'

async function handlerWithErrors (alexaRequest: Common.SHS.Request, context: AWSLambda.Context): Promise<Common.SHS.Response> {
  if (typeof alexaRequest.directive.endpoint === 'undefined' ||
        typeof alexaRequest.directive.endpoint.endpointId === 'undefined') {
    switch (alexaRequest.directive.header.namespace) {
      case 'Alexa.Authorization':
        return alexaAuthorization.handler(alexaRequest)
      case 'Alexa.Discovery':
        return alexaDiscovery.handler(alexaRequest)
      default:
        throw Common.SHS.Error.errorResponseForInvalidDirectiveNamespace(alexaRequest)
    }
  } else {
    return await Bridge.sendSkillDirective(alexaRequest)
  }
}

async function handler (event: Common.SHS.Request, context: AWSLambda.Context): Promise<Common.SHS.Response> {
  const alexaRequest = new Common.SHS.Request(event)

  Common.Debug.debug('smart home skill request message')
  Common.Debug.debug(JSON.stringify(alexaRequest, null, 2))

  let alexaResponse: Common.SHS.Response

  try {
    alexaResponse = await handlerWithErrors(alexaRequest, context)
    Common.Debug.debug('smart home skill response message')
    Common.Debug.debug(JSON.stringify(alexaResponse, null, 2))
  } catch (error) {
    let alexaError: Common.SHS.Error
    if (error instanceof Common.SHS.Error) {
      alexaError = error
    } else {
      alexaError = Common.SHS.Error.errorResponseFromError(alexaRequest, error)
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
