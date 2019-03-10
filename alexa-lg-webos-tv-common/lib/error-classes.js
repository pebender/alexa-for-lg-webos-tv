class GenericError extends Error {
    constructor(name, message, ...args) {
        super(message, ...args);
        this.name = name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class UnititializedClassError extends GenericError {
    constructor(className, methodName) {
        super("UnitializedClass", `method '${methodName}' called but class '${className}' not initialized.`);
    }
}

module.exports = {
    "GenericError": GenericError,
    "UnititializedClassError": UnititializedClassError
};