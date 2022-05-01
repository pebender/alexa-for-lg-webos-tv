export function debug(message?: any, optionalParams?: any[]) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    console.debug(message, optionalParams);
  }
}

export function debugError(error: any) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    const message = (error as any).message ? (error as any).message : "unknown";
    const name = (error as any).name
      ? (error as any).name
      : (error as any).code
      ? (error as any).code
      : "unknown";
    console.debug(`error: ${message} (${name})`);
  }
}

export function debugErrorWithStack(error: any) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    const message = (error as any).message ? (error as any).message : "unknown";
    const name = (error as any).name
      ? (error as any).name
      : (error as any).code
      ? (error as any).code
      : "unknown";
    console.debug(`error: ${message} (${name})`);

    const stack = (error as any).stack
      ? (error as any).stack
      : Error.captureStackTrace(error);
    console.debug(stack);
  }
}

export function debugJSON(message: any) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    console.debug(JSON.stringify(message, null, 2));
  }
}
