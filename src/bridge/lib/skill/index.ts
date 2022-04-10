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
import { constants } from '../../../common/constants'
import { DatabaseTable } from '../database'
import * as https from 'https'

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

async function authorizeUser (db: DatabaseTable, bearerToken: string | undefined): Promise<boolean> {
  async function getUserProfile (bearerToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        hostname: 'api.amazon.com',
        path: '/user/profile',
        headers: {
          Authorization: `Bearer ${bearerToken}`
        }
      }
      const req = https.request(options, (response) => {
        let returnData = ''

        response.on('data', (chunk) => {
          returnData += chunk
        })

        response.on('end', () => {
          resolve(JSON.parse(returnData))
        })

        response.on('error', (error) => {
          reject(error)
        })
      })
      req.end()
    })
  }

  if (typeof bearerToken === 'undefined') {
    return false
  }

  const record = await db.getRecord({ bearerToken })
  if (record === null) {
    const userProfile = await getUserProfile(bearerToken)

    if ((!('user_id' in userProfile)) || (!('email' in userProfile))) {
      return false
    }
    const userId = userProfile.user_id
    const email = userProfile.email

    const found = constants.user.emails.find((element) => (element === email))
    if (typeof found === 'undefined') {
      return false
    }

    await db.updateOrInsertRecord({ email }, { email, userId, bearerToken })
  }

  return true
}

async function handlerWithoutValidation (event: ASH.Request, db: DatabaseTable, backend: Backend): Promise<ASH.Response> {
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
    const udn = alexaRequest.getEndpointId()
    if (typeof udn === 'undefined') {
      switch (alexaRequest.directive.header.namespace) {
        case 'Alexa.Authorization':
          return alexaAuthorization.handler(alexaRequest, backend)
        case 'Alexa.Discovery': {
          const bearerToken = alexaRequest.getBearerToken()
          if (typeof bearerToken === 'undefined') {
            throw Error()
          }
          const authorized = await authorizeUser(db, bearerToken)
          if (!authorized) {
            throw Error()
          }
          return alexaDiscovery.handler(alexaRequest, backend)
        }
        default:
          return ASH.errorResponse(
            alexaRequest,
            'INTERNAL_ERROR',
          `Unknown namespace ${alexaRequest.directive.header.namespace}`
          )
      }
    }
    const bearerToken = alexaRequest.getBearerToken()
    if (typeof bearerToken === 'undefined') {
      throw Error()
    }
    const authorized = await authorizeUser(db, bearerToken)
    if (!authorized) {
      throw Error()
    }
    const backendControl = backend.control(udn)
    if (typeof backendControl === 'undefined') {
      return ASH.errorResponse(
        alexaRequest,
        'INTERNAL_ERROR',
        `unknown LGTV UDN ${udn}`
      )
    }
    switch (alexaRequest.directive.header.namespace) {
      case 'Alexa':
        return addStates(await alexa.handler(alexaRequest, backendControl), backendControl)
      case 'Alexa.PowerController':
        return addStates(await alexaPowerController.handler(alexaRequest, backendControl), backendControl)
      case 'Alexa.Speaker':
        return addStates(await alexaSpeaker.handler(alexaRequest, backendControl), backendControl)
      case 'Alexa.ChannelController':
        return addStates(await alexaChannelController.handler(alexaRequest, backendControl), backendControl)
      case 'Alexa.InputController':
        return addStates(await alexaInputController.handler(alexaRequest, backendControl), backendControl)
      case 'Alexa.Launcher':
        return addStates(await alexaLauncher.handler(alexaRequest, backendControl), backendControl)
      case 'Alexa.PlaybackController':
        return addStates(await alexaPlaybackController.handler(alexaRequest, backendControl), backendControl)
      default:
        return ASH.errorResponse(
          alexaRequest,
          'INTERNAL_ERROR',
        `Unknown namespace ${alexaRequest.directive.header.namespace}`
        )
    }
  } catch (error) {
    if (error instanceof Error) {
      return ASH.errorResponseFromError(alexaRequest, error)
    } else {
      return ASH.errorResponse(alexaRequest, 'Unknown', 'Unknown')
    }
  }
}

export class SmartHomeSkill {
  private db: DatabaseTable
  private backend: Backend
  public constructor (frontendDb: DatabaseTable, backend: Backend) {
    this.db = frontendDb
    this.backend = backend
  }

  public handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
    return handlerWithoutValidation(alexaRequest, this.db, this.backend)
  }
}

export { capabilities, states, handlerWithoutValidation as handler }
