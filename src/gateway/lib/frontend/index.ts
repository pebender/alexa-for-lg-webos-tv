import {CustomSkill} from "../custom-skill";
import {DatabaseTable} from "../database";
import {FrontendExternal} from "./frontend-external";
import {FrontendInternal} from "./frontend-internal";
import {FrontendSecurity} from "./frontend-security";
import {Mutex} from "async-mutex";
import {SmartHomeSkill} from "../smart-home-skill";
import {UninitializedClassError} from "../../../common";

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

    private throwIfNotInitialized(methodName: string): void {
        if (this._initialized === false) {
            throw new UninitializedClassError("Frontend", methodName);
        }
    }

    public initialize(): Promise<void> {
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

    public start(): void {
        this.throwIfNotInitialized("start");
        this._internal.start();
        this._external.start();
    }

    public get security(): FrontendSecurity {
        this.throwIfNotInitialized("get+security");
        return this._security;
    }

    public get internal(): FrontendInternal {
        this.throwIfNotInitialized("get+internal");
        return this._internal;
    }

    public get external(): FrontendExternal {
        this.throwIfNotInitialized("get+external");
        return this._external;
    }
}