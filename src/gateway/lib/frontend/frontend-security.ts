import {constants} from "../../../common/constants";
import {throwIfUninitializedClass} from "../error-classes";
import {DatabaseTable} from "../database";
import {Mutex} from "async-mutex";

export class FrontendSecurity {
    private _initialized: boolean;
    private readonly _db: DatabaseTable;
    private readonly _initializeMutex: Mutex;
    public constructor(db: DatabaseTable) {
        this._initialized = false;
        this._db = db;
        this._initializeMutex = new Mutex();
    }

    public initialize(): Promise<void> {
        const that: FrontendSecurity = this;
        return that._initializeMutex.runExclusive((): Promise<void> => new Promise<void>((resolve): void => {
            if (that._initialized === true) {
                resolve();
                return;
            }
            that._initialized = true;
            resolve();
        }));
    }

    public authorizeRoot(username: string, password: string): boolean {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "authorizeRoot");
        if (username === "HTTP" && password === constants.gatewayRootPassword) {
            return true;
        }
        return false;
    }

    public async authorizeUser(username: string, password: string): Promise<boolean> {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "authorizeUser");
        const record = await this._db.getRecord({"name": "password"});
        if (record === null || typeof record.value === "undefined" || record.value === null) {
            return false;
        }
        if (username === "LGTV" && password === record.value) {
            return true;
        }
        return false;
    }

    public async userPasswordIsNull(): Promise<boolean> {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "userPasswordIsNull");
        const record = await this._db.getRecord({"name": "password"});
        if (record === null || typeof record.value === "undefined" || record.value === null) {
            return true;
        }
        return false;
    }

    public setUserPassword(password: string | null): Promise<void> {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "setUserPassword");
        return this._db.updateOrInsertRecord(
            {"name": "password"},
            {
                "name": "password",
                "value": password
            }
        );
    }

    public async getHostname(): Promise<string> {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "getHostname");
        const record = await this._db.getRecord({"name": "hostname"});
        if (typeof record.value !== "string") {
            return "";
        }
        return record.value;
    }

    public async setHostname(hostname: string): Promise<void> {
        throwIfUninitializedClass(this._initialized, this.constructor.name, "setHostname");
        await this._db.updateOrInsertRecord(
            {"name": "hostname"},
            {
                "name": "hostname",
                "value": hostname
            }
        );
    }
}