import EventEmitter from "events";
import {Mutex} from "async-mutex";
const {UnititializedClassError} = require("alexa-lg-webos-tv-common");
import {AlexaRequest, AlexaResponse} from "alexa-lg-webos-tv-common";
import {BackendController} from "./backend-controller";
import {BackendSearcher} from "./backend-searcher";
import {DatabaseTable} from "./../database";
import {TV, UDN} from "../common";

export class Backend extends EventEmitter {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _controller: BackendController;
    private _searcher: BackendSearcher;
    private _throwIfNotInitialized: (methodName: string) => void;
    constructor(db: DatabaseTable) {
        super();

        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._controller = new BackendController(db);
        this._searcher = new BackendSearcher();

        this._throwIfNotInitialized = (methodName: string) => {
            if (this._initialized === false) {
                throw new UnititializedClassError("Backend", methodName);
            }
        };
    }

    initialize(): Promise<void> {
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
                that.emit("error", error, "BackendController");
            });
            that._searcher.on("found", (tv: TV) => {
                that._controller.tvUpsert(tv);
            });
            await that._searcher.initialize();
            that._initialized = true;
            resolve();
        }));
    }

    start(): void {
        this._throwIfNotInitialized("start");
        return this._searcher.now();
    }

    runCommand(event: any): Promise<any> {
        this._throwIfNotInitialized("runCommand");
        return this._controller.runCommand(event);
    }

    skillCommand(event: AlexaRequest): Promise<AlexaResponse> {
        this._throwIfNotInitialized("skillCommand");
        return this._controller.skillCommand(event);
    }

    getUDNList(): UDN[] {
        this._throwIfNotInitialized("getUDNList");
        return this._controller.getUDNList();
    }

    tv(udn: UDN) {
        this._throwIfNotInitialized("tv");
        return this._controller.tv(udn);
    }

    lgtvCommand(udn: UDN, command: {uri: string, payload?: any}): Promise<{[x: string]: any}> {
        this._throwIfNotInitialized("lgtvCommand");
        return this._controller.lgtvCommand(udn, command);
    }

    getPowerState(udn: UDN): "OFF" | "ON" {
        this._throwIfNotInitialized("getPowerState");
        return this._controller.getPowerState(udn);
    }

    turnOff(udn: UDN) {
        this._throwIfNotInitialized("turnOff");
        return this._controller.turnOff(udn);
    }

    turnOn(udn: UDN) {
        this._throwIfNotInitialized("turnOn");
        return this._controller.turnOn(udn);
    }
}

export {BackendController} from "./backend-controller";