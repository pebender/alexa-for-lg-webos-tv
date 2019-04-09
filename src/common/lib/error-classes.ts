export class UninitializedClassError extends Error {
    public constructor(className: string, methodName: string) {
        super(`method '${methodName}' called on unitialized class '${className}'`);
        Error.captureStackTrace(this, this.constructor);
    }
}