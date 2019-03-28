import {AlexaRequest,
    AlexaResponse,
    UninitializedClassError} from "../common";
import {BackendControl,
    LGTVRequest,
    LGTVResponse} from "./backend-control";
import {TV,
    UDN} from "../tv";
import {BackendController} from "./backend-controller";
import {BackendSearcher} from "./backend-searcher";
import {DatabaseTable} from "./../database";
import EventEmitter from "events";
import {Mutex} from "async-mutex";
import {handler as rawHandler} from "./custom-skill";
import {handler as smartHomeSkillHandler} from "./smart-home-skill";

export {BackendControl,
    LGTVRequest,
    LGTVRequestPayload,
    LGTVResponse} from "./backend-control";

export class Backend extends EventEmitter {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _controller: BackendController;
    private _searcher: BackendSearcher;
    private _throwIfNotInitialized: (methodName: string) => void;
    public constructor(db: DatabaseTable) {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._controller = new BackendController(db);
        this._searcher = new BackendSearcher();

        this._throwIfNotInitialized = (methodName: string) => {
            if (this._initialized === false) {
                throw new UninitializedClassError("Backend", methodName);
            }
        };
    }

    public initialize(): Promise<void> {
        const that = this;
        return that._initializeMutex.runExclusive(() => new Promise<void>(async (resolve) => {
            if (that._initialized === true) {
                resolve();
                return;
            }

            that._controller.on("error", (error: Error, id: string) => {
                that.emit("error", error, `BackendController.${id}`);
            });
            await that._controller.initialize();
            that._searcher.on("error", (error) => {
                that.emit("error", error, "BackendSearcher");
            });
            that._searcher.on("found", (tv: TV) => {
                that._controller.tvUpsert(tv);
            });
            await that._searcher.initialize();
            that._initialized = true;
            resolve();
        }));
    }

    public start(): void {
        this._throwIfNotInitialized("start");
        return this._searcher.now();
    }

    public runCommand(event: {udn: string; lgtvRequest: LGTVRequest}): Promise<LGTVResponse> {
        this._throwIfNotInitialized("runCommand");
        return rawHandler(this, event);
    }

    public skillCommand(event: AlexaRequest): Promise<AlexaResponse> {
        this._throwIfNotInitialized("skillCommand");
        return smartHomeSkillHandler(this, event);
    }

    public getUDNList(): UDN[] {
        this._throwIfNotInitialized("getUDNList");
        return this._controller.getUDNList();
    }

    public control(udn: UDN): BackendControl {
        this._throwIfNotInitialized("tv");
        return this._controller.control(udn);
    }

    public tv(udn: UDN): TV {
        this._throwIfNotInitialized("tv");
        return this._controller.control(udn).tv;
    }

    public lgtvCommand(udn: UDN, lgtvRequest: LGTVRequest): Promise<LGTVResponse> {
        this._throwIfNotInitialized("lgtvCommand");
        return this._controller.control(udn).lgtvCommand(lgtvRequest);
    }

    public getPowerState(udn: UDN): "OFF" | "ON" {
        this._throwIfNotInitialized("getPowerState");
        return this._controller.control(udn).getPowerState();
    }

    public turnOff(udn: UDN): boolean {
        this._throwIfNotInitialized("turnOff");
        return this._controller.control(udn).turnOff();
    }

    public turnOn(udn: UDN): Promise<boolean> {
        this._throwIfNotInitialized("turnOn");
        return this._controller.control(udn).turnOn();
    }
}