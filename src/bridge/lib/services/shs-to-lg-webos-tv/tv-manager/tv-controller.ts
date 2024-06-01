import { EventEmitter } from "node:events";
import type LGTV from "lgtv2";
import * as Common from "../../../../../common";
import { DatabaseTable } from "../../../database";
import type { TvRecord, UDN } from "./tv-record";
import { TvCommonError } from "./tv-common-error";
import { TvControl } from "./tv-control";

export class TvController extends EventEmitter {
  private readonly _database: DatabaseTable<TvRecord>;
  private readonly _controls: Record<string, TvControl>;
  private constructor(
    _database: DatabaseTable<TvRecord>,
    _controls: Record<string, TvControl>,
  ) {
    super();

    this._database = _database;
    this._controls = _controls;
  }

  public static async build(
    _configurationDirectory: string,
  ): Promise<TvController> {
    const _database = await DatabaseTable.build<TvRecord>(
      _configurationDirectory,
      "tv",
      ["udn"],
    );
    const _controls = {};

    const tvController = new TvController(_database, _controls);

    async function tvsInitialize(tvs: TvRecord[]): Promise<void> {
      async function tvInitialize(tv: TvRecord): Promise<void> {
        if (tvController._controls[tv.udn] === undefined) {
          tvController._controls[tv.udn] = TvControl.build(
            tvController._database,
            tv,
          );
          tvController.eventsAdd(tv.udn);
          await tvController._controls[tv.udn].start();
        }
      }

      const tvInitializers: Array<Promise<void>> = [];
      for (const tv of tvs) {
        tvInitializers.push(tvInitialize(tv));
      }
      await Promise.all(tvInitializers);
    }

    const records = await tvController._database.getRecords();
    await tvsInitialize(records);

    return tvController;
  }

  public start(): void {
    for (const udn of Object.keys(this._controls)) {
      this._controls[udn].start().catch(Common.Debug.debugError);
    }
  }

  private eventsAdd(udn: UDN): void {
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
      this._controls[udn].on(
        uri,
        (error: Common.CommonError | null, response: LGTV.Request | null) => {
          this.emit(uri, error, response, udn);
        },
      );
    }

    this._controls[udn].on("error", (error: Common.CommonError): void => {
      this.emit("error", error, udn);
    });
  }

  public async tvUpsert(tv: TvRecord): Promise<void> {
    try {
      const record = await this._database.getRecord([
        { udn: tv.udn },
        { name: tv.name },
        { ip: tv.ip },
        { url: tv.url },
        { mac: tv.mac },
      ]);
      if (record === null) {
        if (Reflect.has(this._controls, tv.udn)) {
          Reflect.deleteProperty(this._controls, tv.udn);
        }
        await this._database.updateOrInsertRecord(
          { udn: tv.udn },
          {
            udn: tv.udn,
            name: tv.name,
            ip: tv.ip,
            url: tv.url,
            mac: tv.mac,
            key: "",
          },
        );
      }
      if (this._controls[tv.udn] === undefined) {
        this._controls[tv.udn] = TvControl.build(this._database, tv);
        this.eventsAdd(tv.udn);
        await this._controls[tv.udn].start();
      }
    } catch (error) {
      this.emit("error", error, tv.udn);
    }
  }

  public control(udn: UDN): TvControl {
    if (this._controls[udn] === undefined) {
      throw new TvCommonError({
        code: "tvUnknown",
        message: `the requested television '${udn}' is not known'`,
      });
    }

    return this._controls[udn];
  }

  public controls(): TvControl[] {
    return Object.values(this._controls);
  }
}
