import * as Common from "@backinthirty/alexa-for-lg-webos-tv-common";

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
 * A {@link Common.CommonError | CommonError} subclass for skill to bridge
 * interface link related errors. The supported errors are given by
 * {@link LinkCommonErrorCode}.
 */
export class LinkCommonError extends Common.CommonError {
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
