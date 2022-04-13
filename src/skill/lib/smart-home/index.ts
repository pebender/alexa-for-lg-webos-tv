import * as ASH from '../../../common/alexa'
import * as AWSLambda from 'aws-lambda'
import * as alexaAuthorization from './authorization'
import * as alexaDiscovery from './discovery'
import { Bridge } from '../bridge-api'

async function remoteResponse (alexaRequest: ASH.Request): Promise<ASH.Response> {
  const bridge = new Bridge('')
  try {
    const alexaResponse = await bridge.sendSkillDirective(alexaRequest)
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
  let alexaRequest: ASH.Request | null = null
  try {
    alexaRequest = new ASH.Request(event)
  } catch (error) {
    if (error instanceof Error) {
      return new ASH.Response({
        namespace: 'Alexa',
        name: 'ErrorResponse',
        payload: {
          type: 'INTERNAL_ERROR',
          message: `${error.name}: ${error.message}`
        }
      })
    } else {
      return new ASH.Response({
        namespace: 'Alexa',
        name: 'ErrorResponse',
        payload: {
          type: 'INTERNAL_ERROR',
          message: 'Unknown: Unknown'
        }
      })
    }
  }

  try {
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
    await bridge.send({ path: Bridge.skillPath() }, alexaRequest, { log: alexaRequest })
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
    await bridge.send({ path: Bridge.skillPath() }, alexaRequest, { log: alexaResponse })
  } catch (error) {
    //
  }

  return alexaResponse
}

export { handlerWithoutLogging as handler }
