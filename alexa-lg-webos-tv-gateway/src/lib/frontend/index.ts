
import {Mutex} from "async-mutex";
import {UnititializedClassError} from "alexa-lg-webos-tv-common";
import {FrontendSecurity} from "./frontend-security";
import {FrontendInternal} from "./frontend-internal";
import {FrontendExternal} from "./frontend-external";
import {DatabaseTable} from "../database";
import {Backend} from "../backend";

export class Frontend {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _security: FrontendSecurity;
    private _internal: FrontendInternal;
    private _external: FrontendExternal;
    private _throwIfNotInitialized: (methodName: string) => void;
    constructor(db: DatabaseTable, backend: Backend) {
        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._security = new FrontendSecurity(db);
        this._internal = new FrontendInternal(this._security);
        this._external = new FrontendExternal(this._security, backend);

        this._throwIfNotInitialized = (methodName) => {
            if (this._initialized === false) {
                throw new UnititializedClassError("Frontend", methodName);
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
            await that._security.initialize();
            await that._internal.initialize();
            await that._external.initialize();
            that._initialized = true;
            resolve();
        }));
    }

    start(): void {
        this._throwIfNotInitialized("start");
        this._internal.start();
        this._external.start();
    }

    get security(): FrontendSecurity {
        this._throwIfNotInitialized("get+security");
        return this._security;
    }

    get internal(): FrontendInternal {
        this._throwIfNotInitialized("get+internal");
        return this._internal;
    }

    get external(): FrontendExternal {
        this._throwIfNotInitialized("get+external");
        return this._external;
    }
}