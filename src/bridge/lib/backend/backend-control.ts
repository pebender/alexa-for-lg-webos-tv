import { randomUUID } from "crypto";
import { Mutex } from "async-mutex";
import * as wol from "wake_on_lan";
import EventEmitter from "events";
import { Client as SsdpClient, SsdpHeaders } from "node-ssdp";
import { DatabaseTable } from "../database";
import LGTV from "lgtv2";
import { TV } from "../tv";

export class BackendControl extends EventEmitter {
  private _poweredOn: boolean;
  private _connecting: boolean;
  private readonly _db: DatabaseTable;
  private readonly _tv: TV;
  private readonly _connection: LGTV;
  private readonly _ssdpNotify: SsdpClient;
  private readonly _ssdpResponse: SsdpClient;
  private constructor(
    _db: DatabaseTable,
    _tv: TV,
    _connection: LGTV,
    _ssdpNotify: SsdpClient,
    _ssdpResponse: SsdpClient
  ) {
    super();

    this._poweredOn = false;
    this._connecting = false;
    this._db = _db;
    this._tv = _tv;
    this._connection = _connection;
    this._ssdpNotify = _ssdpNotify;
    this._ssdpResponse = _ssdpResponse;
  }

  public static build(db: DatabaseTable, tv: TV) {
    const _tv: TV = {
      udn: tv.udn,
      name: tv.name,
      ip: tv.ip,
      url: tv.url,
      mac: tv.mac,
    };

    const clientKey = typeof tv.key === "string" ? tv.key : "";

    function saveKey(key: string, callback: (error: Error) => void): void {
      db.updateRecord({ udn: _tv.udn }, { $set: { key } })
        .then(() => {
          _tv.key = key;
          _connection.clientKey = key;
        })
        .catch((error): void => callback(error));
    }

    const _connection = new LGTV({
      url: _tv.url,
      timeout: 10000,
      reconnect: 0,
      clientKey,
      saveKey,
    });

    const _ssdpNotify = new SsdpClient({ sourcePort: 1900 });
    const _ssdpResponse = new SsdpClient();

    const backendControl = new BackendControl(
      db,
      _tv,
      _connection,
      _ssdpNotify,
      _ssdpResponse
    );

    // Added event handlers.
    backendControl._connection.on(
      "error",
      (error: NodeJS.ErrnoException): void => {
        backendControl._connecting = false;
        if (error && error.code !== "EHOSTUNREACH") {
          backendControl.emit("error", error, backendControl._tv.udn);
        }
      }
    );
    backendControl._connection.on("connecting", (): void => {
      backendControl._connecting = true;
    });
    backendControl._connection.on("connect", (): void => {
      backendControl.emit("connect");
      backendControl._connecting = false;
      backendControl._poweredOn = true;
      backendControl.addSubscriptionEvents();
    });
    backendControl._connection.on("close", (): void => {
      backendControl._connecting = false;
    });

    function ssdpConnectHandler(headers: SsdpHeaders): void {
      if (
        headers.USN ===
        `${backendControl._tv.udn}::urn:lge-com:service:webos-second-screen:1`
      ) {
        if (backendControl._connecting === false) {
          backendControl._connection.connect(backendControl._tv.url);
        }
      }
    }

    function ssdpDisconnectHandler(headers: SsdpHeaders): void {
      if (
        headers.USN ===
        `${backendControl._tv.udn}::urn:lge-com:service:webos-second-screen:1`
      ) {
        backendControl._poweredOn = false;
        backendControl._connection.disconnect();
      }
    }

    backendControl._ssdpNotify.on("advertise-alive", ssdpConnectHandler);
    backendControl._ssdpNotify.on("advertise-bye", ssdpDisconnectHandler);
    backendControl._ssdpResponse.on("response", ssdpConnectHandler);

    return backendControl;
  }

  public start() {
    this._ssdpNotify.start();
  }

  public get tv(): TV {
    return Object.assign({}, this._tv);
  }

  public turnOff(): boolean {
    const lgtvCommand: LGTV.Request = {
      uri: "ssap://system/turnOff",
    };
    this._connection.request(lgtvCommand.uri);
    this._poweredOn = false;
    return true;
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
  public turnOn(): Promise<boolean> {
    const that = this;

    function startInterval(
      milliseconds: number,
      handler: () => void
    ): NodeJS.Timeout {
      handler();
      return setInterval(handler, milliseconds);
    }

    return new Promise<boolean>((resolve): void => {
      that._poweredOn = false;
      that._connection.disconnect();
      let finishTimeoutObject: NodeJS.Timeout | null = null;
      let monitorTimeoutObject: NodeJS.Timeout | null = null;
      let wolTimeoutObject: NodeJS.Timeout | null = null;
      let searchTimeoutObject: NodeJS.Timeout | null = null;

      //
      // The function cleans up and then resolves the function's promise.
      // It uses a mutex and a uuid to ensure that clean up and the
      // function's promise resolution is only performed once. The mutex
      // protects the clean up phase ensures that clean up is called only
      // once. The uuid, which is set during the clean up phase, ensures
      // that the function's promise resolution is called only once.
      //
      let finished = false;
      const finishMutex = new Mutex();
      let finishUUID: string | null = null;
      async function finish(poweredOn: boolean): Promise<void> {
        const currentUUID = await finishMutex.runExclusive(
          (): Promise<string | null> =>
            new Promise<string | null>((resolve): void => {
              if (finished === true) {
                resolve(null);
                return;
              }
              finishUUID = randomUUID();

              if (wolTimeoutObject !== null) {
                clearInterval(wolTimeoutObject);
                wolTimeoutObject = null;
              }
              if (searchTimeoutObject !== null) {
                clearInterval(searchTimeoutObject);
                searchTimeoutObject = null;
              }
              if (monitorTimeoutObject !== null) {
                clearInterval(monitorTimeoutObject);
                monitorTimeoutObject = null;
              }
              if (finishTimeoutObject !== null) {
                clearTimeout(finishTimeoutObject);
                finishTimeoutObject = null;
              }
              resolve(finishUUID);
            })
        );
        if (finishUUID !== null && currentUUID === finishUUID) {
          if (finished === false) {
            finishUUID = null;
            finished = true;
            resolve(poweredOn);
          }
        }
      }

      finishTimeoutObject = setTimeout(finish, 7000, false);

      monitorTimeoutObject = startInterval(100, (): void => {
        if (that._poweredOn === true) {
          finish(true);
        }
      });
      wolTimeoutObject = startInterval(201, (): void => {
        wol.wake(that._tv.mac);
      });
      searchTimeoutObject = startInterval(251, (): void => {
        if (that._ssdpResponse !== null) {
          that._ssdpResponse.search(
            "urn:lge-com:service:webos-second-screen:1"
          );
        }
      });
    });
  }

  public getPowerState(): "OFF" | "ON" {
    return this._poweredOn ? "ON" : "OFF";
  }

  public async lgtvCommand(lgtvRequest: LGTV.Request): Promise<LGTV.Response> {
    let lgtvResponse: LGTV.Response = {
      returnValue: false,
    };
    if (lgtvRequest.payload === null) {
      lgtvResponse = await new Promise<LGTV.Response>(
        (resolve, reject): void => {
          this._connection.request(
            lgtvRequest.uri,
            (error: Error, response: LGTV.Response): void => {
              if (error) {
                reject(error);
                return;
              }
              resolve(response);
            }
          );
        }
      );
    } else {
      lgtvResponse = await new Promise((resolve, reject): void => {
        this._connection.request(
          lgtvRequest.uri,
          lgtvRequest.payload as LGTV.RequestPayload,
          (error: Error, response: LGTV.Response): void => {
            if (error) {
              reject(error);
              return;
            }
            resolve(response);
          }
        );
      });
    }
    if (typeof lgtvResponse.returnValue === "undefined") {
      const error = new Error(
        "'LGTVResponse' does not contain property 'returnValue'"
      );
      error.name = "NO_RETURN_VALUE";
      Error.captureStackTrace(error);
      throw error;
    }
    if (lgtvResponse.returnValue === false) {
      const error = new Error(lgtvResponse.errorText?.toString());
      if (typeof lgtvResponse.errorCode !== "undefined") {
        error.name = lgtvResponse.errorCode?.toString();
      }
      Error.captureStackTrace(error);
      throw error;
    }
    return lgtvResponse;
  }

  private addSubscriptionEvents() {
    const that = this;

    {
      const uri = "ssap://audio/getStatus";
      that._connection.subscribe(uri, (error, response) => {
        that.emit(uri, error, response);
      });
    }

    {
      const uri = "ssap://audio/getVolume";
      that._connection.subscribe(uri, (error, response) => {
        that.emit(uri, error, response);
      });
    }
    {
      const uri = "ssap://com.webos.applicationManager/getForegroundAppInfo";
      that._connection.subscribe(uri, (error, response) => {
        that.emit(uri, error, response);
        if (response.appId === "com.webos.app.livetv") {
          const u: string = "ssap://tv/getCurrentChannel";
          that._connection.subscribe(u, (e, r) => that.emit(u, e, r));
        }
      });
    }

    {
      const uri = "ssap://com.webos.applicationManager/listApps";
      that._connection.subscribe(uri, (error, response) => {
        that.emit(uri, error, response);
      });
    }

    {
      const uri = "ssap://com.webos.applicationManager/listLaunchPoints";
      that._connection.subscribe(uri, (error, response) => {
        that.emit(uri, error, response);
      });
    }

    {
      const uri = "ssap://tv/getChannelList";
      that._connection.subscribe(uri, (error, response) => {
        that.emit(uri, error, response);
      });
    }

    {
      const uri = "ssap://tv/getExternalInputList";
      that._connection.subscribe(uri, (error, response) => {
        that.emit(uri, error, response);
      });
    }
  }
}
