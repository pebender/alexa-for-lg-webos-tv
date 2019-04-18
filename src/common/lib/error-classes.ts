export function throwIfUninitializedClass(classInitialized: boolean, className: string, methodName: string): void {
    if (classInitialized === false) {
        throw new Error(`method '${methodName}' called on unitialized class '${className}'`);
    }
}