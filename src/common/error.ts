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
    this.general = general;
    this.code = this.general;
    if (typeof options?.specific !== "undefined") {
      this.specific = options.specific;
      this.code = `${this.code}.${this.specific}`;
    }
    this.name = this.code;
    Error.captureStackTrace(this);
  }
}

export function create(options?: CommonErrorOptions): CommonError {
  return new CommonError(options);
}
