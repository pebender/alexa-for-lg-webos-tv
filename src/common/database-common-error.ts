import { CommonError } from "./common-error";

export type DatabaseCommonErrorCode =
  | "unknown"
  | "fieldInvalid"
  | "fieldNotFound"
  | "fieldValueNotFound"
  | "fieldValueNotUnique"
  | "recordNotFound"
  | "recordNotUnique";

/**
 * A {@link CommonError} subclass for database related errors. The supported
 * errors codes are given by {@link DatabaseCommonErrorCode}.
 */
export class DatabaseCommonError extends CommonError {
  public readonly code: DatabaseCommonErrorCode;

  constructor(options: {
    code?: DatabaseCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "DatabaseCommonError";
    this.code = options.code ?? "unknown";
  }
}
