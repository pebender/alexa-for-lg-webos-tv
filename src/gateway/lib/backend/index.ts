import {TV,
    UDN} from "../tv";
import {AlexaLGwebOSTVObject} from "../error-classes";
import {BackendControl} from "./backend-control";
import {BackendController} from "./backend-controller";
import {BackendSearcher} from "./backend-searcher";
import {DatabaseTable} from "./../database";

export {BackendControl} from "./backend-control";

export class Backend extends AlexaLGwebOSTVObject {
    private readonly _controller: BackendController;
    private readonly _searcher: BackendSearcher;
    public constructor(db: DatabaseTable) {
        super();

        this._controller = new BackendController(db);
        this._searcher = new BackendSearcher();
    }

    public initialize(): Promise<void> {
        const that = this;
        function initializeFunction(): Promise<void> {
            return new Promise<void>(async (resolve): Promise<void> => {
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
                resolve();
            });
        }
        return this.initializeHandler(initializeFunction);
    }

    public start(): void {
        this.throwIfUninitialized("start");
        return this._searcher.now();
    }

    public control(udn: UDN): BackendControl {
        this.throwIfUninitialized("control");
        return this._controller.control(udn);
    }

    public controls(): BackendControl[] {
        this.throwIfUninitialized("controls");
        return this._controller.controls();
    }
}