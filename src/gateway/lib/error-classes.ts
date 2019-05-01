import EventEmitter from "events";
import {Mutex} from "async-mutex";

export class BaseClass extends EventEmitter {
    protected initialized: boolean;
    protected initializeMutex: Mutex;

    public constructor() {
        super();
        this.initialized = false;
        this.initializeMutex = new Mutex();
    }

    protected throwIfUninitialized(methodName: string): void {
        if (this.initialized === false) {
            throw new Error(`method '${methodName}' called on uninitialized class '${this.constructor.name}'`);
        }
    }

    protected initializeHandler(initializeFunction: () => Promise<void>): Promise<void> {
        const that = this;
        return that.initializeMutex.runExclusive(async (): Promise<void> => {
            if (that.initialized === true) {
                return;
            }
            await initializeFunction();
            that.initialized = true;
            return;
        });
    }
}