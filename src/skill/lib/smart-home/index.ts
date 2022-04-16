import * as alexaAuthorization from './authorization'
import * as alexaDiscovery from './discovery'
import * as ASH from '../../../common/alexa'
import { constants } from '../../../common/constants'
import * as Bridge from '../bridge-api'
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

  if (constants.development.skill.debug) {
    console.log('smart home skill request message')
    console.log(JSON.stringify(alexaRequest, null, 2))
  }

  let alexaResponse: ASH.AlexaResponse

  try {
    alexaResponse = await handlerWithErrors(alexaRequest, context)
    if (constants.development.skill.debug) {
      console.log('smart home skill response message')
      console.log(JSON.stringify(alexaResponse, null, 2))
    }
  } catch (error) {
    let alexaError: ASH.AlexaError
    if (error instanceof ASH.AlexaError) {
      alexaError = error
    } else {
      alexaError = ASH.errorResponseFromError(alexaRequest, error)
    }
    alexaResponse = alexaError.response
    if (constants.development.skill.debug) {
      console.log('smart home skill error response message')
      console.log(JSON.stringify(alexaResponse, null, 2))
      console.log('smart home skill stack trace')
      if (typeof alexaError.stack !== 'undefined') {
        console.log(alexaError.stack)
      }
    }
  }

  return alexaResponse
}

export { handler }
