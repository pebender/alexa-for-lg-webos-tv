import * as Debug from '../../../common/debug'
import { BaseClass } from '../base-class'
import { FrontendAuthorization } from './frontend-authorization'
import { FrontendExternal } from './frontend-external'
import { SmartHomeSkill } from '../skill'

export class Frontend extends BaseClass {
  private _external: FrontendExternal
  public constructor (frontendAuthorization: FrontendAuthorization, smartHomeSkill: SmartHomeSkill) {
    super()

    this._external = new FrontendExternal(frontendAuthorization, smartHomeSkill)
  }

  public initialize (): Promise<void> {
    const that = this

    async function initializeFunction (): Promise<void> {
      try {
        await that._external.initialize()
      } catch (error) {
        Debug.debugErrorWithStack(error)
        process.exit(1)
      }
    }

    return this.initializeHandler(initializeFunction)
  }

  public start (): void {
    this.throwIfUninitialized('start')
    this._external.start()
  }

  public get external (): FrontendExternal {
    this.throwIfUninitialized('get+external')
    return this._external
  }
}
