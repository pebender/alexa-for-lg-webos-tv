export abstract class CommonError
  extends Error
  implements NodeJS.ErrnoException
{
  public abstract code: string;

  protected constructor(options: {
    code?: string;
    message?: string;
    cause?: unknown;
  }) {
    const message = options.message ?? "";
    super(message, { cause: options.cause });
    this.name = "CommonError";
  }
}

export type GeneralCommonErrorCode = "unknown";

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

export type AuthorizationCommonErrorCode =
  | "bridgeHostnameNotFound"
  | "bridgeTokenNotFound"
  | "userProfileInvalidScope"
  | "userProfileInvalidToken"
  | "userProfileEmailNotFound"
  | "userProfileUserIdNotFound";

export class AuthorizationCommonError extends CommonError {
  public readonly code: AuthorizationCommonErrorCode;

  constructor(options: {
    code: AuthorizationCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "AuthorizationCommonError";
    this.code = options.code;
  }
}

export type DatabaseCommonErrorCode =
  | "unknown"
  | "fieldInvalid"
  | "fieldNotFound"
  | "fieldValueNotFound"
  | "fieldValueNotUnique"
  | "recordNotFound"
  | "recordNotUnique";

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

export type HttpCommonErrorCode =
  | "badGateway"
  | "badRequest"
  | "bodyFormatInvalid"
  | "bodyNotFound"
  | "connectionInterrupted"
  | "contentTypeNotFound"
  | "contentTypeValueInvalid"
  | "forbidden"
  | "internalServerError"
  | "statusCodeNotFound"
  | "unauthorized"
  | "unknown";

export class HttpCommonError extends CommonError {
  public readonly code: HttpCommonErrorCode;

  constructor(options: {
    code: HttpCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "HttpCommonError";
    this.code = options.code;
  }
}

export type LinkCommonErrorCode =
  | "unknown"
  | "authorizationFailed"
  | "bridgeHostnameNotFound"
  | "bridgeTokenNotFound"
  | "httpConnectionFailed"
  | "tcpConnectionFailed"
  | "tlsCertificateValidationFailed"
  | "tlsCertificateHostnameValidationFailed"
  | "tlsConnectionFailed"
  | "userProfileFetchFailed";

export class LinkCommonError extends CommonError {
  public readonly code: LinkCommonErrorCode;

  constructor(options: {
    code?: LinkCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "LinkCommonError";
    this.code = options.code ?? "unknown";
  }
}

export type TvCommonErrorCode =
  | "unknown"
  | "connectionRequestError"
  | "connectionResponseError"
  | "connectionResponseInvalidFormat"
  | "descriptionXmlFetchError"
  | "descriptionXmlFormatError"
  | "descriptionXmlParseError"
  | "lgtvApiViolation"
  | "macAddressError"
  | "off"
  | "requestInvalidInCurrentState"
  | "responseInvalid"
  | "responseValueUnknown"
  | "searchError"
  | "subscriptionError"
  | "tvUnknown";

export class TvCommonError extends CommonError {
  public readonly code: TvCommonErrorCode;

  constructor(options: {
    code?: TvCommonErrorCode;
    message?: string;
    cause?: unknown;
    udn?: string;
  }) {
    super(options);
    this.name = "TvCommonError";
    this.code = options.code ?? "unknown";
  }
}
