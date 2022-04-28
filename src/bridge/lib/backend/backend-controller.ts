import { TV, UDN } from "../tv";
import EventEmitter from "events";
import { BackendControl } from "./backend-control";
import { DatabaseRecord, DatabaseTable } from "../database";

export class BackendController extends EventEmitter {
  private readonly _db: DatabaseTable;
  private readonly _controls: { [x: string]: BackendControl };
  public constructor(
    _db: DatabaseTable,
    _controls: { [x: string]: BackendControl }
  ) {
    super();

    this._db = _db;
    this._controls = _controls;
  }

  public static async build(): Promise<BackendController> {
    const _db = await DatabaseTable.build("backend", ["udn"], "udn");
    const _controls = {};

    const backendController = new BackendController(_db, _controls);
    await backendController.initialize();

    return backendController;
  }

  private throwIfNotKnownTV(methodName: string, udn: UDN): void {
    if (typeof this._controls[udn] === "undefined") {
      throw new Error(
        `the requested television '${udn}' is not known in 'BackendController.${methodName}'`
      );
    }
  }

  private async initialize(): Promise<void> {
    const that: BackendController = this;

    function eventsAdd(udn: UDN): void {
      that._controls[udn].on("error", (error: Error): void => {
        that.emit("error", error, udn);
      });
    }

    async function tvInitialize(tv: TV): Promise<void> {
      if (typeof that._controls[tv.udn] === "undefined") {
        that._controls[tv.udn] = await BackendControl.build(that._db, tv);
        eventsAdd(tv.udn);
      }
    }

    function tvsInitialize(records: DatabaseRecord[]): Promise<void> {
      const tvs: TV[] = records as unknown as TV[];
      const tvInitializers: Promise<void>[] = [];
      tvs.forEach((tv: TV): void => {
        tvInitializers.push(tvInitialize(tv));
      });
      return Promise.all(tvInitializers).then();
    }

    async function initializeFunction(): Promise<void> {
      await that._db.getRecords({}).then(tvsInitialize);
    }

    return await initializeFunction();
  }

  public async tvUpsert(tv: TV): Promise<void> {
    const that: BackendController = this;

    function eventsAdd(udn: UDN): void {
      that._controls[udn].on("error", (error: Error): void => {
        that.emit("error", error, udn);
      });
    }

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
        if (Reflect.has(this._controls, tv.udn) === true) {
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
          }
        );
      }
      if (typeof this._controls[tv.udn] === "undefined") {
        this._controls[tv.udn] = await BackendControl.build(this._db, tv);
        eventsAdd(tv.udn);
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
