import * as util from "node:util";

export function debug(message?: unknown) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    console.debug(message);
  }
}

export function debugError(error: unknown) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    console.debug("error:" + "\n" + util.inspect(error));
  }
}

export function debugErrorWithStack(error: unknown) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    if (
      typeof error === "object" &&
      error !== null &&
      typeof (error as any).stack === "undefined"
    ) {
      Error.captureStackTrace(error);
    }
    console.debug("error:" + "\n" + util.inspect(error));
  }
}

export function debugJSON(message: unknown) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    console.debug(JSON.stringify(message, null, 2));
  }
}
