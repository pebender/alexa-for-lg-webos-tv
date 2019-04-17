import {UninitializedClassError,
    constants} from "../../../common";
import {DatabaseTable} from "../database";
import {Mutex} from "async-mutex";

export class FrontendSecurity {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _db: DatabaseTable;
    public constructor(db: DatabaseTable) {
        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._db = db;
    }

    private throwIfNotInitialized(methodName: string): void {
        if (this._initialized === false) {
            throw new UninitializedClassError("FrontendSecurity", methodName);
        }
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
        this.throwIfNotInitialized("authorizeRoot");
        if (username === "HTTP" && password === constants.gatewayRootPassword) {
            return true;
        }
        return false;
    }

    public async authorizeUser(username: string, password: string): Promise<boolean> {
        this.throwIfNotInitialized("authorizeUser");
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
        this.throwIfNotInitialized("userPasswordIsNull");
        const record = await this._db.getRecord({"name": "password"});
        if (record === null || typeof record.value === "undefined" || record.value === null) {
            return true;
        }
        return false;
    }

    public setUserPassword(password: string | null): Promise<void> {
        this.throwIfNotInitialized("setUserPassword");
        return this._db.updateOrInsertRecord(
            {"name": "password"},
            {
                "name": "password",
                "value": password
            }
        );
    }

    public async getHostname(): Promise<string> {
        this.throwIfNotInitialized("getHostname");
        const record = await this._db.getRecord({"name": "hostname"});
        if (typeof record.value !== "string") {
            return "";
        }
        return record.value;
    }

    public async setHostname(hostname: string): Promise<void> {
        this.throwIfNotInitialized("setHostname");
        await this._db.updateOrInsertRecord(
            {"name": "hostname"},
            {
                "name": "hostname",
                "value": hostname
            }
        );
    }
}