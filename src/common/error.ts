export type AlexaForLGwebOSTVErrorGeneral =
  | "unknown"
  | "authorization"
  | "database"
  | "http"
  | "link";

export type AlexaForLGwebOSTVErrorLocation =
  | "skill"
  | "skill_link"
  | "skill_user_profile"
  | "skill_user_db"
  | "bridge_link"
  | "bridge_link_user_profile"
  | "bridge_link_user_db"
  | "bridge_service"
  | "bridge_service_user_profile"
  | "bridge_service_user_db"
  | "bridge_service_auth_db";

export type AlexaForLGwebOSTVErrorOptions = {
  general: AlexaForLGwebOSTVErrorGeneral;
  specific?: string;
  sender?: AlexaForLGwebOSTVErrorLocation;
  receiver?: AlexaForLGwebOSTVErrorLocation;
  cause?: any;
};

export class AlexaForLGwebOSTVError
  extends Error
  implements NodeJS.ErrnoException
{
  public readonly code: string;
  public readonly general: AlexaForLGwebOSTVErrorGeneral;
  public readonly specific?: string;
  public readonly receiver?: AlexaForLGwebOSTVErrorLocation;
  public readonly sender?: AlexaForLGwebOSTVErrorLocation;

  constructor(message: string, options?: AlexaForLGwebOSTVErrorOptions) {
    if (typeof options === "undefined") {
      super(message);
      this.general = "unknown";
      this.code = this.general;
    } else {
      super(message, { cause: options.cause });
      this.general = options.general;
      this.code = this.general;
      if (typeof options.specific !== "undefined") {
        this.specific = options.specific;
        this.code = `${this.code}.${this.specific}`;
      }
      if (typeof options.receiver !== "undefined") {
        this.receiver = options.receiver;
        this.code = `${this.code}.${this.receiver}`;
      }
      if (typeof options.sender !== "undefined") {
        this.sender = options.sender;
        this.code = `${this.code}.${this.sender}`;
      }
    }
    if (
      typeof process.env.NODE_ENV !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      Error.captureStackTrace(this);
    }
  }
}

export function create(
  message: string,
  options?: AlexaForLGwebOSTVErrorOptions,
): AlexaForLGwebOSTVError {
  return new AlexaForLGwebOSTVError(message, options);
}
