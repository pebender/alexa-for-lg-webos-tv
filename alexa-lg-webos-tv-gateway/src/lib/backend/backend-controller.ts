import {DatabaseRecord,
    DatabaseTable} from "../database";
import {GenericError,
    UninitializedClassError} from "alexa-lg-webos-tv-common";
import {TV,
    UDN} from "../common";
import {BackendControl} from "./backend-control";
import EventEmitter from "events";
import {Mutex} from "async-mutex";

export class BackendController extends EventEmitter {
    private _initialized = false;
    private _initializeMutex = new Mutex();
    private _db: DatabaseTable;
    private _controls: {[x: string]: BackendControl};
    private _throwIfNotInitialized: (methodName: string) => void
    private _throwIfNotKnownTV: (methodName: string, udn: UDN) => void
    public constructor (db: DatabaseTable) {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._db = db;
        this._controls = {};

        this._throwIfNotInitialized = (methodName: string) => {
            if (this._initialized === false) {
                throw new UninitializedClassError("BackendController", methodName);
            }
        };

        this._throwIfNotKnownTV = (methodName: string, udn: UDN) => {
            if (Reflect.has(this._controls, udn) === false) {
                throw new GenericError(
                    "UnknownTVError",
                    `the requested television '${udn}' is not known in 'BackendController.${methodName}'`
                );
            }
        };
    }

    public initialize(): Promise<void> {
        const that: BackendController = this;

        function eventsAdd(udn: UDN): void {
            that._controls[udn].on("error", (error: any) => {
                that.emit("error", error, udn);
            });
        }

        return that._initializeMutex.runExclusive(() => new Promise<void>(async (resolve, reject) => {
            if (that._initialized === true) {
                resolve();
                return;
            }

            const records: TV[] = (await that._db.getRecords({}) as TV[]);
            await records.forEach((record) => {
                if (Reflect.has(that._controls, record.udn) === false) {
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
            that._controls[udn].on("error", (error: any) => {
                that.emit("error", error, udn);
            });
        }

        that._throwIfNotInitialized("tvUpsert");
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
            if (Reflect.has(this._controls, tv.udn) === false) {
                this._controls[tv.udn] = new BackendControl(this._db, tv);
                await this._controls[tv.udn].initialize();
                eventsAdd(tv.udn);
            }
        } catch (error) {
            this.emit("error", error, tv.udn);
        }
    }

    public getUDNList(): UDN[] {
        this._throwIfNotInitialized("getUDNList");
        return Object.keys(this._controls);
    }

    public control(udn: UDN): BackendControl {
        this._throwIfNotInitialized("control");
        this._throwIfNotKnownTV("control", udn);
        return this._controls[udn];
    }
}