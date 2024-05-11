import * as Common from "../../../common";
import { TV, UDN } from "./tv";
import { EventEmitter } from "node:events";
import { BackendControl } from "./backend-control";
import { DatabaseRecord, DatabaseTable } from "../database";

export class BackendController extends EventEmitter {
  private readonly _db: DatabaseTable;
  private readonly _controls: { [x: string]: BackendControl };
  private constructor(
    _db: DatabaseTable,
    _controls: { [x: string]: BackendControl },
  ) {
    super();

    this._db = _db;
    this._controls = _controls;
  }

  public static async build(): Promise<BackendController> {
    const _db = await DatabaseTable.build("backend", ["udn"], "udn");
    const _controls = {};

    const backendController = new BackendController(_db, _controls);

    function tvsInitialize(records: DatabaseRecord[]): Promise<void> {
      async function tvInitialize(tv: TV): Promise<void> {
        if (typeof backendController._controls[tv.udn] === "undefined") {
          backendController._controls[tv.udn] = await BackendControl.build(
            backendController._db,
            tv,
          );
          backendController.eventsAdd(tv.udn);
          backendController._controls[tv.udn].start();
        }
      }

      const tvs: TV[] = records as unknown as TV[];
      const tvInitializers: Promise<void>[] = [];
      tvs.forEach((tv: TV): void => {
        tvInitializers.push(tvInitialize(tv));
      });
      return Promise.all(tvInitializers).then();
    }

    const records = await backendController._db.getRecords({});
    await tvsInitialize(records);

    return backendController;
  }

  public start(): void {
    Object.keys(this._controls).forEach((udn) => {
      this._controls[udn].start();
    });
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
    uriList.forEach((uri) => {
      this._controls[udn].on(uri, (error, response) => {
        this.emit(uri, error, response, udn);
      });
    });

    this._controls[udn].on("error", (error: Error): void => {
      this.emit("error", error, udn);
    });
  }

  private throwIfNotKnownTV(methodName: string, udn: UDN): void {
    if (typeof this._controls[udn] === "undefined") {
      throw Common.Error.create(
        `the requested television '${udn}' is not known in 'BackendController.${methodName}'`,
      );
    }
  }

  public async tvUpsert(tv: TV): Promise<void> {
    try {
      const record = await this._db.getRecord({
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
        await this._db.updateOrInsertRecord(
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
      if (typeof this._controls[tv.udn] === "undefined") {
        this._controls[tv.udn] = await BackendControl.build(this._db, tv);
        this.eventsAdd(tv.udn);
        this._controls[tv.udn].start();
      }
    } catch (error) {
      this.emit("error", error, tv.udn);
    }
  }

  public control(udn: UDN): BackendControl {
    this.throwIfNotKnownTV("control", udn);
    return this._controls[udn];
  }

  public controls(): BackendControl[] {
    return Object.values(this._controls);
  }
}
