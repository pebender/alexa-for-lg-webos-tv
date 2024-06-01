//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { EventEmitter } from "node:events";
import type LGTV from "lgtv2";
import * as Common from "../../../../../common";
import type { TvRecord, UDN } from "./tv-record";
import type { TvControl } from "./tv-control";
import { TvController } from "./tv-controller";
import { TvSearcher } from "./tv-searcher";

export { TvControl } from "./tv-control";
export { TvController } from "./tv-controller";
export { TvSearcher } from "./tv-searcher";
export * as TvRecord from "./tv-record";
export { TvCommonError, type TvCommonErrorCode } from "./tv-common-error";

export class TvManager extends EventEmitter {
  private readonly _configurationDirectory: string;
  private readonly _controller: TvController;
  private readonly _searcher: TvSearcher;
  private constructor(
    _configurationDirectory: string,
    _controller: TvController,
    _searcher: TvSearcher,
  ) {
    super();

    this._configurationDirectory = _configurationDirectory;
    this._controller = _controller;
    this._searcher = _searcher;
  }

  public static async build(
    _configurationDirectory: string,
  ): Promise<TvManager> {
    const _controller = await TvController.build(_configurationDirectory);
    const _searcher = TvSearcher.build();

    const tvManager = new TvManager(
      _configurationDirectory,
      _controller,
      _searcher,
    );

    tvManager._controller.on(
      "error",
      (id: string, error: Common.CommonError): void => {
        tvManager.emit("error", error, `TvController.${id}`);
      },
    );

    const uriList: string[] = [
      "ssap://audio/getStatus",
      "ssap://audio/getVolume",
      "ssap://com.webos.applicationManager/getForegroundAppInfo",
      "ssap://com.webos.applicationManager/listApps",
      "ssap://com.webos.applicationManager/listLaunchPoints",
      "ssap://tv/getChannelList",
      "ssap://tv/getCurrentChannel",
      "ssap://tv/getExternalInputList",
    ];
    for (const uri of uriList) {
      tvManager._controller.on(
        uri,
        (
          error: Common.CommonError | null,
          response: LGTV.Response | null,
          udn: string,
        ) => {
          tvManager.emit(uri, error, response, udn);
        },
      );
    }

    tvManager._searcher.on("error", (error: Common.CommonError): void => {
      tvManager.emit("error", error, "TvSearcher");
    });
    tvManager._searcher.on("found", (tv: TvRecord) => {
      void tvManager._controller.tvUpsert(tv).catch(Common.Debug.debugError);
    });

    return tvManager;
  }

  public async start(): Promise<void> {
    this._controller.start();
    await this._searcher.start();
  }

  public control(udn: UDN): TvControl {
    return this._controller.control(udn);
  }

  public controls(): TvControl[] {
    return this._controller.controls();
  }
}
