import * as Common from '../../../common'
import * as alexa from './alexa'
import * as alexaAuthorization from './authorization'
import * as alexaChannelController from './channel-controller'
import * as alexaDiscovery from './discovery'
import * as alexaInputController from './input-controller'
import * as alexaLauncher from './launcher'
import * as alexaPlaybackController from './playback-controller'
import * as alexaPowerController from './power-controller'
import * as alexaSpeaker from './speaker'
import {
  Backend,
  BackendControl
} from '../backend'
import { FrontendAuthorization } from '../frontend/frontend-authorization'

interface HandlerFunction {
  (alexaRequest: Common.SHS.Request, backendControl: BackendControl): Promise<Common.SHS.Response>;
}

const handlers: {
  [x: string]: HandlerFunction;
} = {
  Alexa: alexa.handler,
  'Alexa.ChannelController': alexaChannelController.handler,
  'Alexa.InputController': alexaInputController.handler,
  'Alexa.Launcher': alexaLauncher.handler,
  'Alexa.PlaybackController': alexaPlaybackController.handler,
  'Alexa.PowerController': alexaPowerController.handler,
  'Alexa.Speaker': alexaSpeaker.handler
}

function capabilities (backendControl: BackendControl): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    ...alexa.capabilities(backendControl),
    ...alexaPowerController.capabilities(backendControl),
    ...alexaSpeaker.capabilities(backendControl),
    ...alexaChannelController.capabilities(backendControl),
    ...alexaInputController.capabilities(backendControl),
    ...alexaLauncher.capabilities(backendControl),
    ...alexaPlaybackController.capabilities(backendControl)
  ]
}

function states (backendControl: BackendControl): Promise<Common.SHS.Context.Property>[] {
  return [
    ...alexa.states(backendControl),
    ...alexaPowerController.states(backendControl),
    ...alexaSpeaker.states(backendControl),
    ...alexaChannelController.states(backendControl),
    ...alexaInputController.states(backendControl),
    ...alexaLauncher.states(backendControl),
    ...alexaPlaybackController.states(backendControl)
  ]
}

async function addStates (alexaResponse: Common.SHS.Response, backendControl: BackendControl): Promise<Common.SHS.Response> {
  try {
    (await Promise.all(states(backendControl))).forEach((state): void => {
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

async function privateHandler (event: Common.SHS.Request, authorization: FrontendAuthorization, backend: Backend): Promise<Common.SHS.Response> {
  const alexaRequest = new Common.SHS.Request(event)

  const bearerToken: string = alexaRequest.getBearerToken()
  try {
    const authorized = await authorization.authorize(bearerToken)
    if (!authorized) {
      throw Common.SHS.Error.errorResponse(alexaRequest, 401, 'INVALID_AUTHORIZATION_CREDENTIAL', '')
    }
  } catch (error) {
    if (error instanceof Common.SHS.Error) {
      throw error
    } else {
      throw Common.SHS.Error.errorResponse(
        alexaRequest,
        500,
        'INTERNAL_ERROR',
        `Authorization Error: namespace='${alexaRequest.directive.header.namespace}'`
      )
    }
  }

  switch (alexaRequest.directive.header.namespace) {
    case 'Alexa.Authorization':
      return await alexaAuthorization.handler(alexaRequest, backend)
    case 'Alexa.Discovery':
      return await alexaDiscovery.handler(alexaRequest, backend)
    default: {
      const udn = alexaRequest.getEndpointId()
      if (typeof udn === 'undefined') {
        throw Common.SHS.Error.errorResponse(
          alexaRequest,
          400,
          'NO_SUCH_ENDPOINT',
          `namespace='${alexaRequest.directive.header.namespace}' has no endpointId'`
        )
      }

      const backendControl = backend.control(udn)
      if (typeof backendControl === 'undefined') {
        throw Common.SHS.Error.errorResponse(
          alexaRequest,
          400,
          'NO_SUCH_ENDPOINT',
          `namespace='${alexaRequest.directive.header.namespace}' has no endpointId='${udn}'`
        )
      }

      if (!(alexaRequest.directive.header.namespace in handlers)) {
        throw Common.SHS.Error.errorResponseForInvalidDirectiveNamespace(alexaRequest)
      }

      const controllerHandler = handlers[alexaRequest.directive.header.namespace]
      let handlerResponse: Common.SHS.Response
      try {
        handlerResponse = await controllerHandler(alexaRequest, backendControl)
      } catch (error) {
        if (error instanceof Common.SHS.Error) {
          handlerResponse = error.response
        } else {
          handlerResponse = Common.SHS.Error.errorResponseFromError(alexaRequest, error).response
        }
      }
      try {
        return await addStates(handlerResponse, backendControl)
      } catch (error) {
        throw Common.SHS.Error.errorResponse(
          alexaRequest,
          500,
          'INTERNAL_ERROR',
          `addStates failed: namespace='${alexaRequest.directive.header.namespace}'`
        )
      }
    }
  }
}

export class SmartHomeSkill {
  private readonly _authorization: FrontendAuthorization
  private readonly _backend: Backend
  public constructor (frontendAuthorization: FrontendAuthorization, backend: Backend) {
    this._authorization = frontendAuthorization
    this._backend = backend
  }

  public async handler (alexaRequest: Common.SHS.Request): Promise<Common.SHS.Response> {
    return await privateHandler(alexaRequest, this._authorization, this._backend)
  }
}

export { capabilities, states }
