import {BaseClass} from "../base-class";
import {CustomSkill} from "../custom-skill";
import {DatabaseTable} from "../database";
import {FrontendExternal} from "./frontend-external";
import {FrontendInternal} from "./frontend-internal";
import {FrontendSecurity} from "./frontend-security";
import {SmartHomeSkill} from "../smart-home-skill";

export class Frontend extends BaseClass {
    private _security: FrontendSecurity;
    private _internal: FrontendInternal;
    private _external: FrontendExternal;
    public constructor(db: DatabaseTable, customSkill: CustomSkill, smartHomeSkill: SmartHomeSkill) {
        super();

        this._security = new FrontendSecurity(db);
        this._internal = new FrontendInternal(this._security);
        this._external = new FrontendExternal(this._security, customSkill, smartHomeSkill);
    }

    public initialize(): Promise<void> {
        const that = this;
        const initializeFunction = (): Promise<void> => new Promise<void>(async (resolve): Promise<void> => {
            await that._security.initialize();
            await that._internal.initialize();
            await that._external.initialize();
            resolve();
        });
        return this.initializeHandler(initializeFunction);
    }

    public start(): void {
        this.throwIfUninitialized("start");
        this._internal.start();
        this._external.start();
    }

    public get security(): FrontendSecurity {
        this.throwIfUninitialized("get+security");
        return this._security;
    }

    public get internal(): FrontendInternal {
        this.throwIfUninitialized("get+internal");
        return this._internal;
    }

    public get external(): FrontendExternal {
        this.throwIfUninitialized("get+external");
        return this._external;
    }
}