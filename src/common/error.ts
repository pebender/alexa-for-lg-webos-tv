export type CommonErrorName =
  | "CommonError"
  | "GeneralCommonError"
  | "AuthorizationCommonError"
  | "DatabaseCommonError"
  | "HttpCommonError"
  | "LinkCommonError"
  | "TvCommonError";

export class CommonError extends Error implements NodeJS.ErrnoException {
  public code: string;

  protected constructor(options: {
    code?: string;
    message?: string;
    cause?: unknown;
  }) {
    const code = options.code ?? "unknown";
    const message = options.message ?? "";

    super(message, { cause: options.cause });
    this.code = code;
    this.name = "CommonError";
  }
}

export type GeneralCommonErrorCode = "unknown";

export class GeneralCommonError extends CommonError {
  constructor(options: {
    code?: GeneralCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super({
      code: options.code ?? "unknown",
      message: options.code ?? "Unknown General Common Error",
      cause: options.cause,
    });
    this.name = "GeneralCommonError";
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
  constructor(options: {
    code?: AuthorizationCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "AuthorizationCommonError";
  }
}

export type DatabaseCommonErrorCode =
  | "fieldInvalid"
  | "fieldNotFound"
  | "fieldValueNotFound"
  | "fieldValueNotUnique"
  | "recordNotFound"
  | "recordNotUnique";

export class DatabaseCommonError extends CommonError {
  constructor(options: {
    code?: DatabaseCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "DatabaseCommonError";
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
  constructor(options: {
    code?: HttpCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "HttpCommonError";
  }
}

export type LinkCommonErrorCode =
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
  constructor(options: {
    code?: LinkCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "LinkCommonError";
  }
}

export type TvCommonErrorCode =
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
  public readonly udn?: string;

  constructor(options: {
    code?: TvCommonErrorCode;
    message?: string;
    cause?: unknown;
    udn?: string;
  }) {
    super(options);
    this.name = "TvCommonError";

    this.udn = options.udn;
  }
}
