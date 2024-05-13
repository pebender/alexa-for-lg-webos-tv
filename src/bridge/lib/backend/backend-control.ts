import { randomUUID } from "crypto";
import { Mutex } from "async-mutex";
import * as wol from "wake_on_lan";
import { EventEmitter } from "node:events";
import {
  Client as SsdpClient,
  Server as SsdpServer,
  SsdpHeaders,
} from "node-ssdp";
import * as Common from "../../../common";
import { DatabaseTable } from "../database";
import LGTV from "lgtv2";
import { TV } from "./tv";

export class BackendControl extends EventEmitter {
  private _poweredOn: boolean;
  private _connecting: boolean;
  private readonly _db: DatabaseTable;
  private readonly _tv: TV;
  private readonly _connection: LGTV;
  private readonly _ssdpNotify: SsdpServer;
  private readonly _ssdpResponse: SsdpClient;
  private constructor(
    _db: DatabaseTable,
    _tv: TV,
    _connection: LGTV,
    _ssdpNotify: SsdpServer,
    _ssdpResponse: SsdpClient,
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
        .catch((error: unknown) => {
          if (error instanceof Error) {
            callback(error);
            return;
          } else {
            callback(
              Common.Error.create("", { general: "unknown", cause: error }),
            );
            return;
          }
        });
    }

    const _connection = new LGTV({
      url: _tv.url,
      timeout: 10000,
      reconnect: 0,
      clientKey,
      saveKey,
    });

    const _ssdpNotify = new SsdpServer();
    const _ssdpResponse = new SsdpClient();

    const backendControl = new BackendControl(
      db,
      _tv,
      _connection,
      _ssdpNotify,
      _ssdpResponse,
    );

    // Added event handlers.
    backendControl._connection.on(
      "error",
      (error: NodeJS.ErrnoException | null): void => {
        backendControl._connecting = false;
        if (error !== null && error.code !== "EHOSTUNREACH") {
          const commonError = Common.Error.create("", {
            general: "tv",
            cause: error,
          });
          backendControl.emit("error", commonError);
        }
      },
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
        if (!backendControl._connecting) {
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

  public async start() {
    await this._ssdpNotify.start();
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
    function startInterval(
      milliseconds: number,
      handler: () => void,
    ): NodeJS.Timeout {
      handler();
      return setInterval(handler, milliseconds);
    }

    return new Promise<boolean>((resolve): void => {
      this._poweredOn = false;
      this._connection.disconnect();
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

      function finish(powerOn: boolean): void {
        async function asyncFinish(poweredOn: boolean): Promise<void> {
          const currentUUID = await finishMutex.runExclusive(
            (): Promise<string | null> =>
              new Promise<string | null>((resolve): void => {
                if (finished) {
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
              }),
          );
          if (finishUUID !== null && currentUUID === finishUUID) {
            if (!finished) {
              finishUUID = null;
              finished = true;
              resolve(poweredOn);
            }
          }
        }

        void asyncFinish(powerOn).catch(Common.Debug.debugErrorWithStack);
      }

      finishTimeoutObject = setTimeout(finish, 7000, false);

      monitorTimeoutObject = startInterval(100, (): void => {
        if (this._poweredOn) {
          finish(true);
        }
      });
      wolTimeoutObject = startInterval(201, (): void => {
        wol.wake(this._tv.mac);
      });
      searchTimeoutObject = startInterval(251, (): void => {
        void this._ssdpResponse.search(
          "urn:lge-com:service:webos-second-screen:1",
        );
      });
    });
  }

  public getPowerState(): "OFF" | "ON" {
    return this._poweredOn ? "ON" : "OFF";
  }

  /**
   * Sends a request to the TV and returns the response.
   *
   * @param lgtvRequest - The LGTV request to send to the TV.
   * @returns The LGTV response from the TV.
   *
   * @throws
   * a {@link Common.Error.CommonError | CommonError} with
   *
   * - general: "tv", specific: "connectionRequestError",
   * - general: "tv", specific: "connectionResponseInvalidFormat",
   * - general: "tv", specific: "connectionResponseError", or
   * - general: "tv", specific: "lgtvApiViolation"
   */
  public async lgtvCommand(lgtvRequest: LGTV.Request): Promise<LGTV.Response> {
    let lgtvResponse: LGTV.Response = {
      returnValue: false,
    };
    if (typeof lgtvRequest.payload === "undefined") {
      lgtvResponse = await new Promise<LGTV.Response>(
        (resolve, reject): void => {
          this._connection.request(
            lgtvRequest.uri,
            (error: Error | null, response?: LGTV.Response): void => {
              if (error !== null) {
                reject(
                  Common.Error.create("TV connection request error", {
                    general: "tv",
                    specific: "connectionRequestError",
                    cause: error,
                  }),
                );
                return;
              }
              if (typeof response === "undefined") {
                reject(
                  Common.Error.create("LGTV API violation", {
                    general: "tv",
                  }),
                );
                return;
              }
              resolve(response);
            },
          );
        },
      );
    } else {
      lgtvResponse = await new Promise((resolve, reject): void => {
        this._connection.request(
          lgtvRequest.uri,
          lgtvRequest.payload as LGTV.RequestPayload,
          (error: Error | null, response?: LGTV.Response): void => {
            if (error !== null) {
              reject(
                Common.Error.create("TV connection request error", {
                  general: "tv",
                  specific: "connectionRequestError",
                  cause: error,
                }),
              );
              return;
            }
            if (typeof response === "undefined") {
              reject(
                Common.Error.create("LGTV API violation", {
                  general: "tv",
                  specific: "lgtvApiViolation",
                }),
              );
              return;
            }
            resolve(response);
          },
        );
      });
    }
    if (typeof lgtvResponse.returnValue === "undefined") {
      throw Common.Error.create("TV connection response missing return value", {
        general: "tv",
        specific: "connectionResponseInvalidFormat",
      });
    }
    if (!lgtvResponse.returnValue) {
      let errorText: string = "unknown";
      let errorCode: string = "unknown";
      if (
        typeof lgtvResponse.errorText !== "undefined" &&
        typeof lgtvResponse.errorText !== "object"
      ) {
        errorText = lgtvResponse.errorText.toString();
      }
      if (
        typeof lgtvResponse.errorCode !== "undefined" &&
        typeof lgtvResponse.errorCode !== "object"
      ) {
        errorCode = lgtvResponse.errorCode.toString();
      }
      throw Common.Error.create(
        `TV connection response returned the error: ${errorText} (${errorCode}`,
        {
          general: "tv",
          specific: "connectionResponseError",
        },
      );
    }
    return lgtvResponse;
  }

  /**
   * Adds subscriptions to TV state change events. State changes communicated
   * from the TV are shared using an {@link EventEmitter | EventEmitter}
   * emitting an event containing the subscription identifier, any error and any
   * response. The error is a {@link Common.Error.CommonError | CommonError}
   * with
   *
   * - general: "tv", specific "subscriptionError",
   * - general: "tv", specific "lgtvApiViolation",
   */
  private addSubscriptionEvents(): void {
    const subscribe = (
      uri: string,
      responseHandler?: (response: LGTV.Response) => void,
    ): void => {
      this._connection.subscribe(
        uri,
        (error: Error | null, response?: LGTV.Response) => {
          if (error !== null) {
            const commonError = Common.Error.create(
              `TV error from subscription "${uri}"`,
              {
                general: "tv",
                specific: "subscriptionError",
                cause: error,
              },
            );
            this.emit(uri, commonError, null);
          } else {
            if (typeof response === "undefined") {
              const commonError = Common.Error.create("LGTV API violation", {
                general: "tv",
                specific: "lgtvApiViolation",
              });
              this.emit(uri, commonError, null);
            } else {
              this.emit(uri, null, response);
              if (typeof responseHandler === "function") {
                responseHandler(response);
              }
            }
          }
        },
      );
    };

    subscribe("ssap://audio/getStatus");
    subscribe("ssap://audio/getVolume");
    subscribe(
      "ssap://com.webos.applicationManager/getForegroundAppInfo",
      (response: LGTV.Response): void => {
        if (response.appId === "com.webos.app.livetv") {
          subscribe("ssap://tv/getCurrentChannel");
        }
      },
    );
    subscribe("ssap://com.webos.applicationManager/listApps");
    subscribe("ssap://com.webos.applicationManager/listLaunchPoints");
    subscribe("ssap://tv/getChannelList");
    subscribe("ssap://tv/getExternalInputList");
  }
}
