import * as ASH from '../../../common/alexa'
import * as AWSLambda from 'aws-lambda'
import * as alexaAuthorization from './authorization'
import * as alexaDiscovery from './discovery'
import { Bridge } from '../bridge-api'

async function remoteResponse (alexaRequest: ASH.Request): Promise<ASH.Response> {
  const bridge = new Bridge('')
  try {
    const alexaResponse = await bridge.sendSkillDirective(alexaRequest, alexaRequest.getBearerToken())
    return alexaResponse
  } catch (error) {
    if (error instanceof Error) {
      return ASH.errorResponseFromError(alexaRequest, error)
    } else {
      return ASH.errorResponse(alexaRequest, 'Unknown', 'Unknown')
    }
  }
}

async function handlerWithoutLogging (event: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
  try {
    const alexaRequest = new ASH.Request(event)
    if (typeof alexaRequest.directive.endpoint === 'undefined' ||
        typeof alexaRequest.directive.endpoint.endpointId === 'undefined') {
      switch (alexaRequest.directive.header.namespace) {
        case 'Alexa.Authorization':
          return alexaAuthorization.handler(alexaRequest)
        case 'Alexa.Discovery':
          return alexaDiscovery.handler(alexaRequest)
        default:
          return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest))
      }
    } else {
      return remoteResponse(alexaRequest)
    }
  } catch (error) {
    if (error instanceof Error) {
      return Promise.resolve(ASH.errorResponseFromError(event, error))
    } else {
      return Promise.resolve(ASH.errorResponse(event, 'Unknown', 'Unknown'))
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function handlerWithLogging (alexaRequest: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
  const bridge = new Bridge('x')
  try {
    await bridge.send({ path: Bridge.skillPath(), token: alexaRequest.getBearerToken() }, { log: alexaRequest })
  } catch (error) {
    //
  }

  let alexaResponse: ASH.Response | null = null
  try {
    alexaResponse = await handlerWithoutLogging(alexaRequest, context)
  } catch (error) {
    if (error instanceof Error) {
      alexaResponse = ASH.errorResponseFromError(alexaRequest, error)
    } else {
      alexaResponse = ASH.errorResponse(alexaRequest, 'Unknown', 'Unknown')
    }
  }

  try {
    await bridge.send({ path: Bridge.skillPath(), token: alexaRequest.getBearerToken() }, { log: alexaResponse })
  } catch (error) {
    //
  }

  return alexaResponse
}

export { handlerWithoutLogging as handler }
