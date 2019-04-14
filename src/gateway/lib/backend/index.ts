import {AlexaRequest,
    AlexaResponse,
    LGTVRequest,
    LGTVResponse,
    UninitializedClassError} from "../../../common";
import {TV,
    UDN} from "../tv";
import {BackendControl} from "./backend-control";
import {BackendController} from "./backend-controller";
import {BackendSearcher} from "./backend-searcher";
import {DatabaseTable} from "./../database";
import EventEmitter from "events";
import {Mutex} from "async-mutex";
import {handler as rawHandler} from "./custom-skill";
import {handler as smartHomeSkillHandler} from "./smart-home-skill";

export {BackendControl} from "./backend-control";

export class Backend extends EventEmitter {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _controller: BackendController;
    private _searcher: BackendSearcher;
    public constructor(db: DatabaseTable) {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._controller = new BackendController(db);
        this._searcher = new BackendSearcher();
    }

    private throwIfNotInitialized(methodName: string): void {
        if (this._initialized === false) {
            throw new UninitializedClassError("Backend", methodName);
        }
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
        this.throwIfNotInitialized("start");
        return this._searcher.now();
    }

    public runCommand(event: {udn: string; lgtvRequest: LGTVRequest}): Promise<LGTVResponse> {
        this.throwIfNotInitialized("runCommand");
        return rawHandler(this, event);
    }

    public skillCommand(event: AlexaRequest): Promise<AlexaResponse> {
        this.throwIfNotInitialized("skillCommand");
        return smartHomeSkillHandler(this, event);
    }

    public control(udn: UDN): BackendControl {
        this.throwIfNotInitialized("control");
        return this._controller.control(udn);
    }

    public controls(): BackendControl[] {
        this.throwIfNotInitialized("controls");

        return this._controller.controls();
    }
}