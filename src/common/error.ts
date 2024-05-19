export type CommonErrorGeneral =
  | "unknown"
  | "authorization"
  | "database"
  | "http"
  | "link"
  | "tv";

export interface CommonErrorOptions {
  message?: string;
  general?: CommonErrorGeneral;
  specific?: string;
  cause?: unknown;
}

export class CommonError extends Error implements NodeJS.ErrnoException {
  public readonly code: string;
  public readonly general: CommonErrorGeneral;
  public readonly specific?: string;

  constructor(options?: CommonErrorOptions) {
    const general = options?.general ?? "unknown";
    const message = options?.message ?? general;
    const cause = options?.cause;
    super(message, { cause });
    this.name = "CommonError";
    this.general = general;
    this.code = this.general;
    if (options?.specific !== undefined) {
      this.specific = options.specific;
      this.code = `${this.code}.${this.specific}`;
    }
    Error.captureStackTrace(this);
  }
}
