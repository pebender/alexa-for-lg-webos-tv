import * as ASH from '../../../common/alexa'
import * as AWSLambda from 'aws-lambda'
import * as alexa from './alexa'
import * as alexaAuthorization from './authorization'
import * as alexaDiscovery from './discovery'
import * as alexaEndpointHealth from './endpoint-health'
import * as alexaPowerController from './power-controller'
import * as alexaRangeController from './range-controller'
import { Gateway } from '../gateway-api'

function capabilities (): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
  return [
    ...alexa.capabilities(),
    ...alexaEndpointHealth.capabilities(),
    ...alexaPowerController.capabilities(),
    ...alexaRangeController.capabilities()
  ]
}

function states (): Promise<ASH.ResponseContextProperty>[] {
  return [
    ...alexa.states(),
    ...alexaEndpointHealth.states(),
    ...alexaPowerController.states(),
    ...alexaRangeController.states()
  ]
}

async function stateHandler (alexaResponse: ASH.Response): Promise<ASH.Response> {
  try {
    (await Promise.all(states())).forEach((state): void => {
      if (typeof state === 'undefined' || state === null ||
                typeof state.value === 'undefined' || state.value === null) {
        return
      }
      alexaResponse.addContextProperty(state)
    })
    return alexaResponse
  } catch (error) {
    return alexaResponse
  }
}

async function remoteResponse (alexaRequest: ASH.Request): Promise<ASH.Response> {
  const gateway = new Gateway('')
  try {
    const alexaResponse = await gateway.sendSkillDirective(alexaRequest)
    return alexaResponse
  } catch (error) {
    if (error instanceof Error) {
      return ASH.errorResponseFromError(alexaRequest, error)
    } else {
      return ASH.errorResponse(alexaRequest, 'Unknown', 'Unknown')
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler (event: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
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
    } else if (alexaRequest.directive.endpoint.endpointId === 'lg-webos-tv-gateway') {
      switch (alexaRequest.directive.header.namespace) {
        case 'Alexa':
          return stateHandler(await alexa.handler(alexaRequest))
        case 'Alexa.EndpointHealth':
          return stateHandler(await alexaEndpointHealth.handler(alexaRequest))
        case 'Alexa.PowerController':
          return stateHandler(await alexaPowerController.handler(alexaRequest))
        case 'Alexa.RangeController':
          return stateHandler(await alexaRangeController.handler(alexaRequest))
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

async function handlerWithLogging (alexaRequest: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
  const gateway = new Gateway('x')
  try {
    await gateway.send({ path: Gateway.skillPath() }, { log: alexaRequest })
  } catch (error) {
    //
  }

  let alexaResponse: ASH.Response | null = null
  try {
    alexaResponse = await handler(alexaRequest, context)
  } catch (error) {
    if (error instanceof Error) {
      alexaResponse = ASH.errorResponseFromError(alexaRequest, error)
    } else {
      alexaResponse = ASH.errorResponse(alexaRequest, 'Unknown', 'Unknown')
    }
  }

  try {
    await gateway.send({ path: Gateway.skillPath() }, { log: alexaResponse })
  } catch (error) {
    //
  }

  return alexaResponse
}

export { capabilities, states, handlerWithLogging as handler }
