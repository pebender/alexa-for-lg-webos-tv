import {TV,
    UDN} from "../tv";
import {BackendControl} from "./backend-control";
import {DatabaseTable} from "../database";
import EventEmitter from "events";
import {Mutex} from "async-mutex";
import {throwIfUninitializedClass} from "../../../common";

export class BackendController extends EventEmitter {
    private _initialized = false;
    private readonly _initializeMutex = new Mutex();
    private readonly _db: DatabaseTable;
    private readonly _controls: {[x: string]: BackendControl};
    public constructor (db: DatabaseTable) {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._db = db;
        this._controls = {};
    }

    private throwIfNotKnownTV(methodName: string, udn: UDN): void {
        if (typeof this._controls[udn] === "undefined") {
            throw new Error(`the requested television '${udn}' is not known in 'BackendController.${methodName}'`);
        }
    }

    public initialize(): Promise<void> {
        const that: BackendController = this;

        function eventsAdd(udn: UDN): void {
            that._controls[udn].on("error", (error: Error): void => {
                that.emit("error", error, udn);
            });
        }

        return that._initializeMutex.runExclusive((): Promise<void> => new Promise<void>(async (resolve, reject): Promise<void> => {
            if (that._initialized === true) {
                resolve();
                return;
            }

            const records: TV[] = ((await that._db.getRecords({}) as unknown) as TV[]);
            await records.forEach((record): void => {
                if (typeof that._controls[record.udn] === "undefined") {
                    that._controls[record.udn] = new BackendControl(that._db, record);
                    that._controls[record.udn].initialize().catch(reject);
                    eventsAdd(record.udn);
                }
            });
            that._initialized = true;
            resolve();
        }));
    }

    public async tvUpsert(tv: TV): Promise<void> {
        const that: BackendController = this;

        function eventsAdd(udn: UDN): void {
            that._controls[udn].on("error", (error: Error): void => {
                that.emit("error", error, udn);
            });
        }

        throwIfUninitializedClass(this._initialized, this.constructor.name, "tvUpsert");
        try {
            const record = await this._db.getRecord({"$and": [
                {"udn": tv.udn},
                {"name": tv.name},
                {"ip": tv.ip},
                {"url": tv.url},
                {"mac": tv.mac}
            ]});
            if (record === null) {
                if (Reflect.has(this._controls, tv.udn) === true) {
                    Reflect.deleteProperty(this._controls, tv.udn);
                }
                await this._db.updateOrInsertRecord(
                    {"udn": tv.udn},
                    {
                        "udn": tv.udn,
                        "name": tv.name,
                        "ip": tv.ip,
                        "url": tv.url,
                        "mac": tv.mac,
                        "key": ""
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
        throwIfUninitializedClass(this._initialized, this.constructor.name, "control");
        this.throwIfNotKnownTV("control", udn);
        return this._controls[udn];
    }

    public controls(): BackendControl[] {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "controls");
        return Object.values(this._controls);
    }
}