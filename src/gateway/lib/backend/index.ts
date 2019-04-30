import {TV,
    UDN} from "../tv";
import {BackendControl} from "./backend-control";
import {BackendController} from "./backend-controller";
import {BackendSearcher} from "./backend-searcher";
import {DatabaseTable} from "./../database";
import EventEmitter from "events";
import {Mutex} from "async-mutex";
import {throwIfUninitializedClass} from "../error-classes";

export {BackendControl} from "./backend-control";

export class Backend extends EventEmitter {
    private _initialized: boolean;
    private readonly _initializeMutex: Mutex;
    private readonly _controller: BackendController;
    private readonly _searcher: BackendSearcher;
    public constructor(db: DatabaseTable) {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._controller = new BackendController(db);
        this._searcher = new BackendSearcher();
    }

    public initialize(): Promise<void> {
        const that = this;
        return that._initializeMutex.runExclusive((): Promise<void> => new Promise<void>(async (resolve): Promise<void> => {
            if (that._initialized === true) {
                resolve();
                return;
            }

            that._controller.on("error", (error: Error, id: string): void => {
                that.emit("error", error, `BackendController.${id}`);
            });
            await that._controller.initialize();
            that._searcher.on("error", (error): void => {
                that.emit("error", error, "BackendSearcher");
            });
            that._searcher.on("found", (tv: TV): void => {
                that._controller.tvUpsert(tv);
            });
            await that._searcher.initialize();
            that._initialized = true;
            resolve();
        }));
    }

    public start(): void {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "start");
        return this._searcher.now();
    }

    public control(udn: UDN): BackendControl {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "control");
        return this._controller.control(udn);
    }

    public controls(): BackendControl[] {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "controls");
        return this._controller.controls();
    }
}