import {TV,
    UDN} from "../tv";
import {BackendControl} from "./backend-control";
import {DatabaseTable} from "../database";
import EventEmitter from "events";
import {Mutex} from "async-mutex";
import {UninitializedClassError} from "../../../common";

export class BackendController extends EventEmitter {
    private _initialized = false;
    private _initializeMutex = new Mutex();
    private _db: DatabaseTable;
    private _controls: {[x: string]: BackendControl};
    public constructor (db: DatabaseTable) {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._db = db;
        this._controls = {};
    }

    private throwIfNotInitialized(methodName: string): void {
        if (this._initialized === false) {
            throw new UninitializedClassError("BackendController", methodName);
        }
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

        that.throwIfNotInitialized("tvUpsert");
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
        this.throwIfNotInitialized("control");
        this.throwIfNotKnownTV("control", udn);
        return this._controls[udn];
    }

    public controls(): BackendControl[] {
        this.throwIfNotInitialized("controls");
        return Object.values(this._controls);
    }
}