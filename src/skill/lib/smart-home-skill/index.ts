import * as alexaAuthorization from './authorization'
import * as alexaDiscovery from './discovery'
import * as ASH from '../../../common/smart-home-skill'
import * as Debug from '../../../common/debug'
import * as Bridge from './bridge-api'
import * as AWSLambda from 'aws-lambda'

async function handlerWithErrors (alexaRequest: ASH.AlexaRequest, context: AWSLambda.Context): Promise<ASH.AlexaResponse> {
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
    return await Bridge.sendSkillDirective(alexaRequest)
  }
}

async function handler (event: ASH.AlexaRequest, context: AWSLambda.Context): Promise<ASH.AlexaResponse> {
  const alexaRequest = new ASH.AlexaRequest(event)

  Debug.debug('smart home skill request message')
  Debug.debug(JSON.stringify(alexaRequest, null, 2))

  let alexaResponse: ASH.AlexaResponse

  try {
    alexaResponse = await handlerWithErrors(alexaRequest, context)
    Debug.debug('smart home skill response message')
    Debug.debug(JSON.stringify(alexaResponse, null, 2))
  } catch (error) {
    let alexaError: ASH.AlexaError
    if (error instanceof ASH.AlexaError) {
      alexaError = error
    } else {
      alexaError = ASH.errorResponseFromError(alexaRequest, error)
    }
    alexaResponse = alexaError.response
    Debug.debug('smart home skill error response message')
    Debug.debug(JSON.stringify(alexaResponse, null, 2))
    Debug.debug('smart home skill stack trace')
    if (typeof alexaError.stack !== 'undefined') {
      Debug.debug(alexaError.stack)
    }
  }

  return alexaResponse
}

export { handler }
