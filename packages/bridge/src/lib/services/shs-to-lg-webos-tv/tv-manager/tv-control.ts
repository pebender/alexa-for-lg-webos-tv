import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { Mutex } from "async-mutex";
import * as wol from "wake_on_lan";
import {
  Client as SsdpClient,
  Server as SsdpServer,
  type SsdpHeaders,
} from "@lvcabral/node-ssdp";
import LGTV from "lgtv2";
import * as Common from "@backinthirty/alexa-for-lg-webos-tv-common";
import type { DatabaseTable } from "../../../database";
import type { TvRecord } from "./tv-record";
import { TvCommonError } from "./tv-common-error";

export class TvControl extends EventEmitter {
  private _poweredOn: boolean;
  private _connecting: boolean;
  private readonly _database: DatabaseTable<TvRecord>;
  private readonly _tv: TvRecord;
  private readonly _connection: LGTV;
  private readonly _ssdpNotify: SsdpServer;
  private readonly _ssdpResponse: SsdpClient;
  private constructor(
    _database: DatabaseTable<TvRecord>,
    _tv: TvRecord,
    _connection: LGTV,
    _ssdpNotify: SsdpServer,
    _ssdpResponse: SsdpClient,
  ) {
    super();

    this._poweredOn = false;
    this._connecting = false;
    this._database = _database;
    this._tv = _tv;
    this._connection = _connection;
    this._ssdpNotify = _ssdpNotify;
    this._ssdpResponse = _ssdpResponse;
  }

  public static build(
    database: DatabaseTable<TvRecord>,
    tv: TvRecord,
  ): TvControl {
    const _tv: TvRecord = {
      udn: tv.udn,
      name: tv.name,
      ip: tv.ip,
      url: tv.url,
      mac: tv.mac,
    };

    const clientKey = typeof tv.key === "string" ? tv.key : "";

    function saveKey(key: string, callback: (error: Error) => void): void {
      database
        .updateOrInsertFields({ udn: _tv.udn }, { key })
        .then(() => {
          _tv.key = key;
          _connection.clientKey = key;
          return null;
        })
        .catch((error: unknown) =>
          setImmediate((): void => {
            if (error instanceof Error) {
              callback(error);
            } else {
              callback(new TvCommonError({ tv, cause: error }));
            }
          }),
        );
    }

    const _connection = new LGTV({
      url: _tv.url,
      timeout: 10_000,
      reconnect: 0,
      clientKey,
      saveKey,
    });

    const _ssdpNotify = new SsdpServer();
    const _ssdpResponse = new SsdpClient();

    const tvControl = new TvControl(
      database,
      _tv,
      _connection,
      _ssdpNotify,
      _ssdpResponse,
    );

    // Added event handlers.
    tvControl._connection.on(
      "error",
      (error: NodeJS.ErrnoException | null): void => {
        tvControl._connecting = false;
        if (error !== null && error.code !== "EHOSTUNREACH") {
          const commonError = new TvCommonError({
            tv: tvControl._tv,
            cause: error,
          });
          tvControl.emit("error", commonError);
        }
      },
    );
    tvControl._connection.on("connecting", (): void => {
      tvControl._connecting = true;
    });
    tvControl._connection.on("connect", (): void => {
      tvControl.emit("connect");
      tvControl._connecting = false;
      tvControl._poweredOn = true;
      tvControl.addSubscriptionEvents();
    });
    tvControl._connection.on("close", (): void => {
      tvControl._connecting = false;
    });

    function ssdpConnectHandler(headers: SsdpHeaders): void {
      if (
        headers.USN !==
        `${tvControl._tv.udn}::urn:lge-com:service:webos-second-screen:1`
      ) {
        return;
      }

      if (!tvControl._connecting) {
        tvControl._connection.connect(tvControl._tv.url);
      }
    }

    function ssdpDisconnectHandler(headers: SsdpHeaders): void {
      if (
        headers.USN ===
        `${tvControl._tv.udn}::urn:lge-com:service:webos-second-screen:1`
      ) {
        return;
      }

      tvControl._poweredOn = false;
      tvControl._connection.disconnect();
    }

    tvControl._ssdpNotify.on("advertise-alive", ssdpConnectHandler);
    tvControl._ssdpNotify.on("advertise-bye", ssdpDisconnectHandler);
    tvControl._ssdpResponse.on("response", ssdpConnectHandler);

    return tvControl;
  }

  public async start(): Promise<void> {
    await this._ssdpNotify.start();
  }

  public get tv(): TvRecord {
    return ({ ...this._tv });
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
    // The method turns on the TvRecord. It forces the TvControl instance to
    // assume the TvRecord is off and to disconnect from the TvRecord. Then, it periodically
    // kicks the TvRecord using Wake On Lan, periodically searches for the TvRecord using
    // UPnP Discovery and waits for the TvControl instance to detect that
    // the TvRecord is on and connected. Before it does any of this, it sets a timeout
    // of 7 seconds in an attempt to ensure that Alexa has the chance for a
    // response before its 8 second timeout.
     */
  public async turnOn(): Promise<boolean> {
    function startInterval(
      milliseconds: number,
      handler: () => void,
    ): NodeJS.Timeout {
      handler();
      return setInterval(handler, milliseconds);
    }

    return await new Promise<boolean>((resolve) => {
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
            async (): Promise<string | null> =>
              await new Promise<string | null>((resolve) => {
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
          if (finishUUID !== null && currentUUID === finishUUID && !finished) {
            finishUUID = null;
            finished = true;
            resolve(poweredOn);
          }
        }

        void asyncFinish(powerOn).catch(Common.Debug.debugError);
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
   * Sends a request to the TvRecord and returns the response.
   *
   * @param lgtvRequest - The LGTV request to send to the TvRecord.
   * @returns The LGTV response from the TvRecord.
   *
   * @throws
   * a {@link Common.CommonError | CommonError} with
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
    if (lgtvRequest.payload === undefined) {
      lgtvResponse = await new Promise<LGTV.Response>((resolve, reject) => {
        this._connection.request(
          lgtvRequest.uri,
          (error: Error | null, response?: LGTV.Response): void => {
            if (error !== null) {
              reject(
                new TvCommonError({
                  code: "connectionRequestError",
                  message: "TvRecord connection request error",
                  tv: this.tv,
                  lgtvRequest,
                  cause: error,
                }),
              );
              return;
            }
            if (response === undefined) {
              reject(
                new TvCommonError({
                  code: "lgtvApiViolation",
                  message: "LGTV API violation",
                  tv: this.tv,
                  lgtvRequest,
                }),
              );
              return;
            }
            resolve(response);
          },
        );
      });
    } else {
      const payload = lgtvRequest.payload;
      lgtvResponse = await new Promise<LGTV.Response>((resolve, reject) => {
        this._connection.request(
          lgtvRequest.uri,
          payload,
          (error: Error | null, response?: LGTV.Response): void => {
            if (error !== null) {
              reject(
                new TvCommonError({
                  code: "connectionRequestError",
                  message: "TvRecord connection request error",
                  tv: this._tv,
                  lgtvRequest,
                  cause: error,
                }),
              );
              return;
            }
            if (response === undefined) {
              reject(
                new TvCommonError({
                  code: "lgtvApiViolation",
                  message: "LGTV API violation",
                  tv: this._tv,
                  lgtvRequest,
                }),
              );
              return;
            }
            resolve(response);
          },
        );
      });
    }
    if (lgtvResponse.returnValue === undefined) {
      throw new TvCommonError({
        code: "connectionResponseInvalidFormat",
        message: "TvRecord connection response missing return value",
        tv: this._tv,
        lgtvRequest,
        lgtvResponse,
      });
    }
    if (!lgtvResponse.returnValue) {
      let errorText = "unknown";
      let errorCode = "unknown";
      if (
        lgtvResponse.errorText !== undefined &&
        typeof lgtvResponse.errorText !== "object"
      ) {
        errorText = lgtvResponse.errorText.toString();
      }
      if (
        lgtvResponse.errorCode !== undefined &&
        typeof lgtvResponse.errorCode !== "object"
      ) {
        errorCode = lgtvResponse.errorCode.toString();
      }
      throw new TvCommonError({
        code: "connectionResponseError",
        message: `TvRecord connection response returned the error: ${errorText} (${errorCode}`,
        tv: this._tv,
        lgtvRequest,
        lgtvResponse,
      });
    }
    return lgtvResponse;
  }

  /**
   * Adds subscriptions to TvRecord state change events. State changes communicated
   * from the TvRecord are shared using an {@link EventEmitter | EventEmitter}
   * emitting an event containing the subscription identifier, any error and any
   * response. The error is a {@link Common.CommonError | CommonError}
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
            const commonError = new TvCommonError({
              code: "subscriptionError",
              message: `TvRecord error from subscription "${uri}"`,
              tv: this._tv,
              cause: error,
            });
            this.emit(uri, commonError, null);
            return;
          }

          if (response === undefined) {
            const commonError = new TvCommonError({
              code: "lgtvApiViolation",
              message: "LGTV API violation",
              tv: this._tv,
            });
            this.emit(uri, commonError, null);
            return;
          }

          this.emit(uri, null, response);

          if (typeof responseHandler === "function") {
            responseHandler(response);
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
