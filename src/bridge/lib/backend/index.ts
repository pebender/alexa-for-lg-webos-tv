//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { EventEmitter } from "node:events";
import type LGTV from "lgtv2";
import * as Common from "../../../common";
import type { Configuration } from "../configuration";
import type { TV, UDN } from "./tv";
import type { BackendControl } from "./backend-control";
import { BackendController } from "./backend-controller";
import { BackendSearcher } from "./backend-searcher";

export { BackendControl } from "./backend-control";
export { BackendController } from "./backend-controller";
export { BackendSearcher } from "./backend-searcher";
export * as TV from "./tv";

export class Backend extends EventEmitter {
  private readonly _configuration: Configuration;
  private readonly _controller: BackendController;
  private readonly _searcher: BackendSearcher;
  private constructor(
    _configuration: Configuration,
    _controller: BackendController,
    _searcher: BackendSearcher,
  ) {
    super();

    this._configuration = _configuration;
    this._controller = _controller;
    this._searcher = _searcher;
  }

  public static async build(configuration: Configuration): Promise<Backend> {
    const _controller = await BackendController.build();
    const _searcher = BackendSearcher.build();

    const backend = new Backend(configuration, _controller, _searcher);

    backend._controller.on(
      "error",
      (id: string, error: Common.Error.CommonError): void => {
        backend.emit("error", error, `BackendController.${id}`);
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
      backend._controller.on(
        uri,
        (
          error: Common.Error.CommonError | null,
          response: LGTV.Response | null,
          udn: string,
        ) => {
          backend.emit(uri, error, response, udn);
        },
      );
    }

    backend._searcher.on("error", (error: Common.Error.CommonError): void => {
      backend.emit("error", error, "BackendSearcher");
    });
    backend._searcher.on("found", (tv: TV) => {
      void backend._controller.tvUpsert(tv).catch(Common.Debug.debugError);
    });

    return backend;
  }

  public async start(): Promise<void> {
    this._controller.start();
    await this._searcher.start();
  }

  public control(udn: UDN): BackendControl {
    return this._controller.control(udn);
  }

  public controls(): BackendControl[] {
    return this._controller.controls();
  }
}
