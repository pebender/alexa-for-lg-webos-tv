import {UninitializedClassError,
    constants} from "../../../common";
import {DatabaseTable} from "../database";
import {Mutex} from "async-mutex";

export class FrontendSecurity {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _db: DatabaseTable;
    private _throwIfNotInitialized: (methodName: string) => void;
    public constructor(db: DatabaseTable) {
        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._db = db;

        this._throwIfNotInitialized = (methodName: string): void => {
            if (this._initialized === false) {
                throw new UninitializedClassError("FrontendSecurity", methodName);
            }
        };
    }

    public initialize(): Promise<void> {
        const that: FrontendSecurity = this;
        return that._initializeMutex.runExclusive(() => new Promise<void>((resolve) => {
            if (that._initialized === true) {
                resolve();
                return;
            }
            that._initialized = true;
            resolve();
        }));
    }

    public authorizeRoot(username: string, password: string): boolean {
        this._throwIfNotInitialized("authorizeRoot");
        if (username === "HTTP" && password === constants.gatewayRootPassword) {
            return true;
        }
        return false;
    }

    public async authorizeUser(username: string, password: string): Promise<boolean> {
        this._throwIfNotInitialized("authorizeUser");
        const record = await this._db.getRecord({"name": "password"});
        if (record === null ||
            Reflect.has(record, "value") === false ||
            record.value === null) {
            return false;
        }
        if (username === "LGTV" && password === record.value) {
            return true;
        }
        return false;
    }

    public async userPasswordIsNull(): Promise<boolean> {
        this._throwIfNotInitialized("userPasswordIsNull");
        const record = await this._db.getRecord({"name": "password"});
        if (record === null ||
            Reflect.has(record, "value") === false ||
            record.value === null
        ) {
            return true;
        }
        return false;
    }

    public setUserPassword(password: string | null): Promise<void> {
        this._throwIfNotInitialized("setUserPassword");
        return this._db.updateOrInsertRecord(
            {"name": "password"},
            {
                "name": "password",
                "value": password
            }
        );
    }

    public async getHostname(): Promise<string> {
        this._throwIfNotInitialized("getHostname");
        const record = await this._db.getRecord({"name": "hostname"});
        if (record === null || Reflect.has(record, "value") === false) {
            return "";
        }
        return record.value;
    }

    public async setHostname(hostname: string): Promise<void> {
        this._throwIfNotInitialized("setHostname");
        await this._db.updateOrInsertRecord(
            {"name": "hostname"},
            {
                "name": "hostname",
                "value": hostname
            }
        );
    }
}