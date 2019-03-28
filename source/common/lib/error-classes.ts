export class GenericError extends Error {
    public constructor(name: string, message: string) {
        super(message);
        this.name = name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UninitializedClassError extends GenericError {
    public constructor(className: string, methodName: string) {
        super("UnitializedClass", `method '${methodName}' called but class '${className}' not initialized.`);
    }
}