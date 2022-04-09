import { BaseClass } from '../base-class'
import { constants } from '../../../common/constants'
import { DatabaseTable } from '../database'
import { FrontendExternal } from './frontend-external'
import { FrontendSecurity } from './frontend-security'
import { SmartHomeSkill } from '../smart-home-skill'

export class Frontend extends BaseClass {
  private _security: FrontendSecurity
  private _external: FrontendExternal
  public constructor (db: DatabaseTable, smartHomeSkill: SmartHomeSkill) {
    super()

    this._security = new FrontendSecurity(db)
    this._external = new FrontendExternal(this._security, smartHomeSkill)
  }

  public initialize (): Promise<void> {
    const that = this

    async function initializeFunction (): Promise<void> {
      try {
        await that._security.initialize()
      } catch (error) {
        if (error instanceof Error) {
          console.log(`error: ${error.name}: ${error.message}`)
          if ('stack' in Error) {
            console.log(error.stack)
          }
        } else {
          console.log('error: unknown')
        }
        process.exit(1)
      }
      try {
        await that._security.setPassword(constants.bridgeUsername, constants.bridgePassword)
      } catch (error) {
        if (error instanceof Error) {
          console.log(`error: ${error.name}: ${error.message}`)
          if ('stack' in Error) {
            console.log(error.stack)
          }
        } else {
          console.log('error: unknown')
        }
        process.exit(1)
      }
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

  public get security (): FrontendSecurity {
    this.throwIfUninitialized('get+security')
    return this._security
  }

  public get external (): FrontendExternal {
    this.throwIfUninitialized('get+external')
    return this._external
  }
}
