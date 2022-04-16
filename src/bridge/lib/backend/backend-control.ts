import { randomUUID } from 'crypto'
import { Mutex } from 'async-mutex'
import * as wol from 'wake_on_lan'
import { BaseClass } from '../base-class'
import {
  Client as SsdpClient,
  SsdpHeaders
} from 'node-ssdp'
import { DatabaseTable } from '../database'
import LGTV from 'lgtv2'
import { TV } from '../tv'

export class BackendControl extends BaseClass {
  private _poweredOn: boolean
  private _connecting: boolean
  private readonly _db: DatabaseTable
  private readonly _tv: TV
  private readonly _connection: LGTV
  private readonly _ssdpNotify: SsdpClient
  private readonly _ssdpResponse: SsdpClient
  public constructor (db: DatabaseTable, tv: TV) {
    super()

    const that: BackendControl = this

    this._poweredOn = false
    this._connecting = false

    this._db = db
    this._tv = {
      udn: tv.udn,
      name: tv.name,
      ip: tv.ip,
      url: tv.url,
      mac: tv.mac
    }

    const clientKey = (typeof tv.key === 'string') ? tv.key : ''

    function saveKey (key: string, callback: (error: Error) => void): void {
      that._db.updateRecord(
        { udn: that._tv.udn },
        { $set: { key } }
      ).then(() => {
        that._tv.key = key
        that._connection.clientKey = key
      }).catch((error): void => callback(error))
    }

    this._connection = new LGTV({
      url: this._tv.url,
      timeout: 10000,
      reconnect: 0,
      clientKey,
      saveKey
    })

    this._connection.on('error', (error: NodeJS.ErrnoException): void => {
      that._connecting = false
      if (error && error.code !== 'EHOSTUNREACH') {
        that.emit('error', error, that._tv.udn)
      }
    })
    this._connection.on('connecting', (): void => {
      that._connecting = true
    })
    this._connection.on('connect', (): void => {
      that._connecting = false
      that._poweredOn = true
    })
    this._connection.on('close', (): void => {
      that._connecting = false
    })

    this._ssdpNotify = new SsdpClient({ sourcePort: 1900 })
    this._ssdpResponse = new SsdpClient()
    function ssdpConnectHandler (headers: SsdpHeaders): void {
      if (headers.USN === `${that._tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
        if (that._connecting === false) {
          that._connection.connect(that._tv.url)
        }
      }
    }

    function ssdpDisconnectHandler (headers: SsdpHeaders): void {
      if (headers.USN === `${that._tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
        that._poweredOn = false
        that._connection.disconnect()
      }
    }

    that._ssdpNotify.on('advertise-alive', ssdpConnectHandler)
    that._ssdpNotify.on('advertise-bye', ssdpDisconnectHandler)
    that._ssdpResponse.on('response', ssdpConnectHandler)
  }

  public initialize (): Promise<void> {
    const that: BackendControl = this

    function initializeFunction (): Promise<void> {
      return that._ssdpNotify.start()
    }
    return this.initializeHandler(initializeFunction)
  }

  public get tv (): TV {
    this.throwIfUninitialized('get+tv')
    return Object.assign({}, this._tv)
  }

  public turnOff (): boolean {
    this.throwIfUninitialized('turnOff')
    const lgtvCommand: LGTV.Request = {
      uri: 'ssap://system/turnOff'
    }
    this._connection.request(lgtvCommand.uri)
    this._poweredOn = false
    return true
  }

  /*
    // The method turns on the TV. It forces the BackendControl instance to
    // assume the TV is off and to disconnect from the TV. Then, it periodically
    // kicks the TV using Wake On Lan, periodically searches for the TV using
    // UPnP Discovery and waits for the BackendControl instance to detect that
    // the TV is on and connected. Before it does any of this, it sets a timeout
    // of 7 seconds in an attempt to ensure that Alexa has the chance for a
    // response before its 8 second timeout.
     */
  public turnOn (): Promise<boolean> {
    const that = this

    function startInterval (milliseconds: number, handler: () => void): NodeJS.Timeout {
      handler()
      return setInterval(handler, milliseconds)
    }

    this.throwIfUninitialized('turnOn')

    return new Promise<boolean>((resolve): void => {
      that._poweredOn = false
      that._connection.disconnect()
      let finishTimeoutObject: NodeJS.Timeout | null = null
      let monitorTimeoutObject: NodeJS.Timeout | null = null
      let wolTimeoutObject: NodeJS.Timeout | null = null
      let searchTimeoutObject: NodeJS.Timeout | null = null

      //
      // The function cleans up and then resolves the function's promise.
      // It uses a mutex and a uuid to ensure that clean up and the
      // function's promise resolution is only performed once. The mutex
      // protects the clean up phase ensures that clean up is called only
      // once. The uuid, which is set during the clean up phase, ensures
      // that the function's promise resolution is called only once.
      //
      let finished = false
      const finishMutex = new Mutex()
      let finishUUID: string | null = null
      async function finish (poweredOn: boolean): Promise<void> {
        const currentUUID = await finishMutex.runExclusive((): Promise<string | null> => new Promise<string | null>((resolve): void => {
          if (finished === true) {
            resolve(null)
            return
          }
          finishUUID = randomUUID()

          if (wolTimeoutObject !== null) {
            clearInterval(wolTimeoutObject)
            wolTimeoutObject = null
          }
          if (searchTimeoutObject !== null) {
            clearInterval(searchTimeoutObject)
            searchTimeoutObject = null
          }
          if (monitorTimeoutObject !== null) {
            clearInterval(monitorTimeoutObject)
            monitorTimeoutObject = null
          }
          if (finishTimeoutObject !== null) {
            clearTimeout(finishTimeoutObject)
            finishTimeoutObject = null
          }
          resolve(finishUUID)
        }))
        if (finishUUID !== null && currentUUID === finishUUID) {
          if (finished === false) {
            finishUUID = null
            finished = true
            resolve(poweredOn)
          }
        }
      }

      finishTimeoutObject = setTimeout(finish, 7000, false)

      monitorTimeoutObject = startInterval(100, (): void => {
        if (that._poweredOn === true) {
          finish(true)
        }
      })
      wolTimeoutObject = startInterval(250, (): void => {
        wol.wake(that._tv.mac)
      })
      searchTimeoutObject = startInterval(1000, (): void => {
        if (that._ssdpResponse !== null) {
          that._ssdpResponse.search('urn:lge-com:service:webos-second-screen:1')
        }
      })
    })
  }

  public getPowerState (): 'OFF' | 'ON' {
    this.throwIfUninitialized('getPowerState')
    return this._poweredOn
      ? 'ON'
      : 'OFF'
  }

  public async lgtvCommand (lgtvRequest: LGTV.Request): Promise<LGTV.Response> {
    this.throwIfUninitialized('lgtvCommand')
    let lgtvResponse: LGTV.Response = {
      returnValue: false
    }
    if (lgtvRequest.payload === null) {
      lgtvResponse = await new Promise<LGTV.Response>((resolve, reject): void => {
        this._connection.request(
          lgtvRequest.uri,
          (error: Error, response: LGTV.Response): void => {
            if (error) {
              reject(error)
              return
            }
            resolve(response)
          }
        )
      })
    } else {
      lgtvResponse = await new Promise((resolve, reject): void => {
        this._connection.request(
          lgtvRequest.uri,
          (lgtvRequest.payload as LGTV.RequestPayload),
          (error: Error, response: LGTV.Response): void => {
            if (error) {
              reject(error)
              return
            }
            resolve(response)
          }
        )
      })
    }
    if (typeof lgtvResponse.returnValue === 'undefined') {
      throw new Error('\'LGTVResponse\' does not contain property \'returnValue\'')
    }
    if (lgtvResponse.returnValue !== true) {
      throw new Error('\'LGTVResponse\' property \'returnValue\' is not true')
    }
    return lgtvResponse
  }
}
