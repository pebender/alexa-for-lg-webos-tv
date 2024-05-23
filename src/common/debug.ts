import { inspect } from "node:util";
import { CommonError } from "./common-error";
import { GeneralCommonError } from "./general-common-error";

export function debug(message: unknown): void {
  if (
    process.env.NODE_ENV !== undefined &&
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

export function debugError(error: unknown): void {
  if (
    process.env.NODE_ENV !== undefined &&
    process.env.NODE_ENV === "development"
  ) {
    const commonError: CommonError =
      error instanceof CommonError
        ? error
        : new GeneralCommonError({
            message: "debugError: 'error' was not of type 'CommonError'",
            cause: error,
          });
    console.debug(
      "error util.inspect:" +
        "\n" +
        inspect(commonError, { depth: 8, getters: true }),
    );
  }
}

export function debugJSON(message: unknown): void {
  if (
    process.env.NODE_ENV !== undefined &&
    process.env.NODE_ENV === "development"
  ) {
    console.debug(JSON.stringify(message, null, 2));
  }
}
