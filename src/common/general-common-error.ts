import { CommonError } from "./common-error";

export type GeneralCommonErrorCode = "unknown" | "unauthorized";

/**
 * A {@link CommonError} subclass for errors that do not fit into any of the
 * other error classes. The supported errors codes are given by
 * {@link GeneralCommonErrorCode}.
 */
export class GeneralCommonError extends CommonError {
  public readonly code: GeneralCommonErrorCode;

  constructor(options: {
    code?: GeneralCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super({
      message: options.code ?? "Unknown General Common Error",
      cause: options.cause,
    });
    this.name = "GeneralCommonError";
    this.code = options.code ?? "unknown";
  }
}
