import { EventEmitter } from "node:events";
import type LGTV from "lgtv2";
import * as Common from "../../../common";
import { type DatabaseRecord, DatabaseTable } from "../database";
import type { TV, UDN } from "./tv";
import { TvCommonError } from "./tv-common-error";
import { BackendControl } from "./backend-control";

export class BackendController extends EventEmitter {
  private readonly _database: DatabaseTable;
  private readonly _controls: Record<string, BackendControl>;
  private constructor(
    _database: DatabaseTable,
    _controls: Record<string, BackendControl>,
  ) {
    super();

    this._database = _database;
    this._controls = _controls;
  }

  public static async build(): Promise<BackendController> {
    const _database = await DatabaseTable.build("backend", ["udn"], "udn");
    const _controls = {};

    const backendController = new BackendController(_database, _controls);

    async function tvsInitialize(records: DatabaseRecord[]): Promise<void> {
      async function tvInitialize(tv: TV): Promise<void> {
        if (backendController._controls[tv.udn] === undefined) {
          backendController._controls[tv.udn] = BackendControl.build(
            backendController._database,
            tv,
          );
          backendController.eventsAdd(tv.udn);
          await backendController._controls[tv.udn].start();
        }
      }

      const tvs: TV[] = records as unknown as TV[];
      const tvInitializers: Array<Promise<void>> = [];
      for (const tv of tvs) {
        tvInitializers.push(tvInitialize(tv));
      }
      await Promise.all(tvInitializers);
    }

    const records = await backendController._database.getRecords({});
    await tvsInitialize(records);

    return backendController;
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

  public async tvUpsert(tv: TV): Promise<void> {
    try {
      const record = await this._database.getRecord({
        $and: [
          { udn: tv.udn },
          { name: tv.name },
          { ip: tv.ip },
          { url: tv.url },
          { mac: tv.mac },
        ],
      });
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
        this._controls[tv.udn] = BackendControl.build(this._database, tv);
        this.eventsAdd(tv.udn);
        await this._controls[tv.udn].start();
      }
    } catch (error) {
      this.emit("error", error, tv.udn);
    }
  }

  public control(udn: UDN): BackendControl {
    if (this._controls[udn] === undefined) {
      throw new TvCommonError({
        code: "tvUnknown",
        message: `the requested television '${udn}' is not known'`,
      });
    }

    return this._controls[udn];
  }

  public controls(): BackendControl[] {
    return Object.values(this._controls);
  }
}
