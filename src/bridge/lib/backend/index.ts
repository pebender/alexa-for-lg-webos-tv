import {
  TV,
  UDN
} from '../tv'
import { BaseClass } from '../base-class'
import { BackendControl } from './backend-control'
import { BackendController } from './backend-controller'
import { BackendSearcher } from './backend-searcher'
import { DatabaseTable } from './../database'

export { BackendControl } from './backend-control'

export class Backend extends BaseClass {
  private readonly _controller: BackendController
  private readonly _searcher: BackendSearcher
  public constructor (db: DatabaseTable) {
    super()

    this._controller = new BackendController(db)
    this._searcher = new BackendSearcher()
  }

  public initialize (): Promise<void> {
    const that = this

    function initializeFunction (): Promise<void> {
      function controllerInitialize (): Promise<void> {
        that._controller.on('error', (error: Error, id: string): void => {
          that.emit('error', error, `BackendController.${id}`)
        })
        return that._controller.initialize()
      }

      function searcherInitialize (): Promise<void> {
        that._searcher.on('error', (error): void => {
          that.emit('error', error, 'BackendSearcher')
        })
        that._searcher.on('found', (tv: TV): void => {
          that._controller.tvUpsert(tv)
        })
        return that._searcher.initialize()
      }

      return controllerInitialize().then(searcherInitialize)
    }
    return this.initializeHandler(initializeFunction)
  }

  public start (): void {
    this.throwIfUninitialized('start')
    return this._searcher.now()
  }

  public control (udn: UDN): BackendControl {
    this.throwIfUninitialized('control')
    return this._controller.control(udn)
  }

  public controls (): BackendControl[] {
    this.throwIfUninitialized('controls')
    return this._controller.controls()
  }
}
