import {AlexaRequest,
    AlexaResponse,
    GenericError,
    UnititializedClassError} from "alexa-lg-webos-tv-common";
import {TV,
    UDN} from "../common";
import {BackendControl} from "./backend-control";
import {DatabaseTable} from "../database";
import EventEmitter from "events";
import {Mutex} from "async-mutex";
const customSkill = require("./custom-skill");
const smartHomeSkill = require("./smart-home-skill");

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
                throw new UnititializedClassError("BackendController", methodName);
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

            const records: any[] = await that._db.getRecords({});
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

        function eventsAdd(udn: UDN) {
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

    public runCommand(event: any): Promise<any> {
        this._throwIfNotInitialized("runCommand");
        return customSkill.handler(this, event);
    }

    public skillCommand(event: AlexaRequest): Promise<AlexaResponse> {
        this._throwIfNotInitialized("skillCommand");
        return smartHomeSkill.handler(this, event);
    }

    public getUDNList(): UDN[] {
        this._throwIfNotInitialized("getUDNList");
        return Object.keys(this._controls);
    }

    public tv(udn: UDN): TV {
        this._throwIfNotInitialized("tv");
        this._throwIfNotKnownTV("tv", udn);
        return this._controls[udn].tv;
    }

    public turnOff(udn: UDN): boolean {
        this._throwIfNotInitialized("turnOff");
        this._throwIfNotKnownTV("turnOff", udn);
        return this._controls[udn].turnOff();
    }

    public turnOn(udn: UDN): Promise<boolean> {
        this._throwIfNotInitialized("turnOn");
        return this._controls[udn].turnOn();
    }

    public getPowerState(udn: UDN): "OFF" | "ON" {
        this._throwIfNotInitialized("getPowerState");
        this._throwIfNotKnownTV("getPowerState", udn);
        return this._controls[udn].getPowerState();
    }

    public lgtvCommand(udn: UDN, command: {uri: string; payload?: any}): Promise<{[x: string]: any}> {
        this._throwIfNotInitialized("lgtvCommand");
        this._throwIfNotKnownTV("lgtvCommand", udn);
        return this._controls[udn].lgtvCommand(command);
    }
}