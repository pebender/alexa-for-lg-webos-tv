import { TV, UDN } from "../tv";
import { BaseClass } from "../base-class";
import { BackendControl } from "./backend-control";
import { DatabaseRecord, DatabaseTable } from "../database";

export class BackendController extends BaseClass {
  private readonly _db: DatabaseTable;
  private readonly _controls: { [x: string]: BackendControl };
  public constructor(db: DatabaseTable) {
    super();

    this._db = db;
    this._controls = {};
  }

  private throwIfNotKnownTV(methodName: string, udn: UDN): void {
    if (typeof this._controls[udn] === "undefined") {
      throw new Error(
        `the requested television '${udn}' is not known in 'BackendController.${methodName}'`
      );
    }
  }

  public initialize(): Promise<void> {
    const that: BackendController = this;

    function eventsAdd(udn: UDN): void {
      that._controls[udn].on("error", (error: Error): void => {
        that.emit("error", error, udn);
      });
    }

    function tvInitialize(tv: TV): Promise<void> {
      if (typeof that._controls[tv.udn] === "undefined") {
        that._controls[tv.udn] = new BackendControl(that._db, tv);
        return that._controls[tv.udn]
          .initialize()
          .then(() => eventsAdd(tv.udn));
      } else {
        return Promise.resolve();
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

    function initializeFunction(): Promise<void> {
      return that._db.getRecords({}).then(tvsInitialize);
    }

    return this.initializeHandler(initializeFunction);
  }

  public async tvUpsert(tv: TV): Promise<void> {
    const that: BackendController = this;

    function eventsAdd(udn: UDN): void {
      that._controls[udn].on("error", (error: Error): void => {
        that.emit("error", error, udn);
      });
    }

    this.throwIfUninitialized("tvUpsert");
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
        this._controls[tv.udn] = new BackendControl(this._db, tv);
        await this._controls[tv.udn].initialize();
        eventsAdd(tv.udn);
      }
    } catch (error) {
      this.emit("error", error, tv.udn);
    }
  }

  public control(udn: UDN): BackendControl {
    this.throwIfUninitialized("control");
    this.throwIfNotKnownTV("control", udn);
    return this._controls[udn];
  }

  public controls(): BackendControl[] {
    this.throwIfUninitialized("controls");
    return Object.values(this._controls);
  }
}
