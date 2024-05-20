/**
 * The error classes used for all errors.
 */

/**
 * The class from which all errors are derived. Deriving all errors from this
 * class ensures that all errors will have an error code (`code`) and will be
 * understood where a `Error` class or a `NodeJS.ErrnoException` interface is
 * expected. Making `code` an abstract string enables each derived error
 * subclass to enumerate the `code` values it supports by declaring `code` to be
 * of a string literal type that enumerates the supported values supported
 * codes.
 */
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

export type AuthorizationCommonErrorCode =
  | "bridgeHostnameNotFound"
  | "bridgeTokenNotFound"
  | "userProfileInvalidScope"
  | "userProfileInvalidToken"
  | "userProfileEmailNotFound"
  | "userProfileUserIdNotFound";

/**
 * A {@link CommonError} subclass for authorization related errors. The
 * supported errors codes are given by {@link AuthorizationCommonErrorCode}.
 */
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

/**
 * A {@link CommonError} subclass for HTTP related errors. The supported errors
 * are given by {@link HttpCommonErrorCode}.
 */
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

/**
 * A {@link CommonError} subclass for skill to bridge interface link related
 * errors. The supported errors are given by {@link LinkCommonErrorCode}.
 */
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

/**
 * A {@link CommonError} subclass for TV related errors. The supported errors
 * are given by {@link TvCommonErrorCode}.
 */
export class TvCommonError extends CommonError {
  public readonly code: TvCommonErrorCode;

  constructor(options: {
    code?: TvCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "TvCommonError";
    this.code = options.code ?? "unknown";
  }
}
