import { BaseClass } from '../base-class'
import { FrontendExternal } from './frontend-external'
import { SmartHomeSkill } from '../skill'

export class Frontend extends BaseClass {
  private _external: FrontendExternal
  public constructor (smartHomeSkill: SmartHomeSkill) {
    super()

    this._external = new FrontendExternal(smartHomeSkill)
  }

  public initialize (): Promise<void> {
    const that = this

    async function initializeFunction (): Promise<void> {
      try {
        await that._external.initialize()
      } catch (error) {
        if (error instanceof Error) {
          console.log(`error: ${error.name}: ${error.message}`)
          if ('stack' in Error) {
            console.log(error.stack)
          }
        } else {
          console.log('error: unknown')
          process.exit(1)
        }
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
