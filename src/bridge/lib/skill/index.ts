import * as ASH from '../../../common/alexa'
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
  (alexaRequest: ASH.Request, backendControl: BackendControl): Promise<ASH.Response>;
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

function capabilities (backendControl: BackendControl): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
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

function states (backendControl: BackendControl): Promise<ASH.ResponseContextProperty>[] {
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

async function addStates (alexaResponse: ASH.Response, backendControl: BackendControl): Promise<ASH.Response> {
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

async function privateHandler (event: ASH.Request, authorization: FrontendAuthorization, backend: Backend): Promise<ASH.Response> {
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

  const bearerToken: string | null = alexaRequest.getBearerToken()
  if (bearerToken === null) {
    return ASH.errorResponse(
      alexaRequest,
      'INTERNAL_ERROR',
      `Missing BearerToken: namespace='${alexaRequest.directive.header.namespace}'`
    )
  }
  try {
    const authorized = await authorization.authorize(bearerToken)
    if (!authorized) {
      return ASH.errorResponse(
        alexaRequest,
        'INTERNAL_ERROR',
        `Invalid BearerToken: namespace='${alexaRequest.directive.header.namespace}'`
      )
    }
  } catch (error) {
    return ASH.errorResponse(
      alexaRequest,
      'INTERNAL_ERROR',
      `Authorization Error: namespace='${alexaRequest.directive.header.namespace}'`
    )
  }

  switch (alexaRequest.directive.header.namespace) {
    case 'Alexa.Discovery': {
      try {
        return await alexaDiscovery.handler(alexaRequest, backend)
      } catch {
        return ASH.errorResponse(
          alexaRequest,
          'INTERNAL_ERROR',
          `handler Error: namespace='${alexaRequest.directive.header.namespace}'`
        )
      }
    }
    case 'Alexa.Authorization': {
      try {
        return await alexaAuthorization.handler(alexaRequest, backend)
      } catch {
        return ASH.errorResponse(
          alexaRequest,
          'INTERNAL_ERROR',
          `handler failed: namespace='${alexaRequest.directive.header.namespace}'`
        )
      }
    }
    default: {
      const udn = alexaRequest.getEndpointId()
      if (typeof udn === 'undefined') {
        return ASH.errorResponse(
          alexaRequest,
          'INTERNAL_ERROR',
          `missing endpointId: namespace='${alexaRequest.directive.header.namespace}'`
        )
      }

      const backendControl = backend.control(udn)
      if (typeof backendControl === 'undefined') {
        return ASH.errorResponse(
          alexaRequest,
          'INTERNAL_ERROR',
          `unknown endpointId: namespace='${alexaRequest.directive.header.namespace}', endpointId='${udn}'`
        )
      }

      if (!(alexaRequest.directive.header.namespace in handlers)) {
        return ASH.errorResponse(
          alexaRequest,
          'INTERNAL_ERROR',
          `unknown namespace: namespace='${alexaRequest.directive.header.namespace}'`
        )
      }

      const controllerHandler = handlers[alexaRequest.directive.header.namespace]
      try {
        const handlerResponse = await controllerHandler(alexaRequest, backendControl)
        try {
          return await addStates(handlerResponse, backendControl)
        } catch (error) {
          return ASH.errorResponse(
            alexaRequest,
            'INTERNAL_ERROR',
              `addStates failed: namespace='${alexaRequest.directive.header.namespace}'`
          )
        }
      } catch (error) {
        return ASH.errorResponse(
          alexaRequest,
          'INTERNAL_ERROR',
            `handler failed: namespace='${alexaRequest.directive.header.namespace}'`
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

  public async handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
    const alexaResponse = await privateHandler(alexaRequest, this._authorization, this._backend)
    return alexaResponse
  }
}

export { capabilities, states }
