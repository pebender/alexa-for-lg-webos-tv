import * as util from "node:util";
import * as CommonError from "./error";

export function debug(message: unknown) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    if (typeof message !== "string" && typeof message !== "number") {
      console.debug(
        `debug: 'message' was type '${typeof message}' but expected 'string' or 'number'.`,
      );
    }
    console.debug(message);
  }
}

export function debugError(error: unknown) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    let commonError: CommonError.CommonError;
    if (error instanceof CommonError.CommonError) {
      commonError = error;
    } else {
      commonError = CommonError.create(
        "debugError: 'error' was not of type 'CommonError'",
        { general: "unknown", cause: error },
      );
    }
    console.debug("error:" + "\n" + util.inspect(commonError));
  }
}

export function debugErrorWithStack(error: unknown) {
  if (
    typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    let commonError: CommonError.CommonError;
    if (error instanceof CommonError.CommonError) {
      commonError = error;
    } else {
      commonError = CommonError.create(
        "debugErrorWithStack: 'error' was not of type 'CommonError'",
        { general: "unknown", cause: error },
      );
    }
    if (typeof commonError.stack === "undefined") {
      Error.captureStackTrace(commonError);
    }
    console.debug("error:" + "\n" + util.inspect(commonError));
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
