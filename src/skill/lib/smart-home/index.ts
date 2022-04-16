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

async function handler (event: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
  const alexaRequest = new ASH.Request(event)

  // return await handlerWithoutLogging(alexaRequest, context)
  return await handlerWithoutLogging(alexaRequest, context)
}

export { handler }
