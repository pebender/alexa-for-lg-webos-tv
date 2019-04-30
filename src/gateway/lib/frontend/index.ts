import {CustomSkill} from "../custom-skill";
import {DatabaseTable} from "../database";
import {FrontendExternal} from "./frontend-external";
import {FrontendInternal} from "./frontend-internal";
import {FrontendSecurity} from "./frontend-security";
import {Mutex} from "async-mutex";
import {SmartHomeSkill} from "../smart-home-skill";
import {throwIfUninitializedClass} from "../error-classes";

export class Frontend {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _security: FrontendSecurity;
    private _internal: FrontendInternal;
    private _external: FrontendExternal;
    public constructor(db: DatabaseTable, customSkill: CustomSkill, smartHomeSkill: SmartHomeSkill) {
        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._security = new FrontendSecurity(db);
        this._internal = new FrontendInternal(this._security);
        this._external = new FrontendExternal(this._security, customSkill, smartHomeSkill);
    }

    public initialize(): Promise<void> {
        const that = this;
        return that._initializeMutex.runExclusive((): Promise<void> => new Promise<void>(async (resolve): Promise<void> => {
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

    public start(): void {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "start");
        this._internal.start();
        this._external.start();
    }

    public get security(): FrontendSecurity {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "get+security");
        return this._security;
    }

    public get internal(): FrontendInternal {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "get+internal");
        return this._internal;
    }

    public get external(): FrontendExternal {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "get+external");
        return this._external;
    }
}