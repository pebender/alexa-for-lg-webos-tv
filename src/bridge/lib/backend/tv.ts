import type LGTV from "lgtv2";
import * as Common from "../../../common";

export type UDN = string;
export type IPv4 = string;
export type IPv6 = string;
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
export type IP = IPv4 | IPv6;
export type MAC = string;

export interface TV {
  udn: UDN;
  name: string;
  ip: IP;
  url: string;
  mac: MAC;
  key?: string;
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
 * A {@link Common.CommonError | CommonError} subclass for TV related
 * errors. The supported errors are given by {@link TvCommonErrorCode}.
 */
export class TvCommonError extends Common.CommonError {
  public readonly code: TvCommonErrorCode;

  constructor(options: {
    code?: TvCommonErrorCode;
    message?: string;
    tv?: TV;
    request?: LGTV.Request;
    response?: LGTV.Response;
    cause?: unknown;
  }) {
    super(options);
    this.name = "TvCommonError";
    this.code = options.code ?? "unknown";
  }
}
