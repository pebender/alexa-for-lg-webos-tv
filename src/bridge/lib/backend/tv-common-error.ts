import type LGTV from "lgtv2";
import { CommonError } from "../../../common";
import type { TV } from "./tv";

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
 * A {@link CommonError} subclass for TV related
 * errors. The supported errors are given by {@link TvCommonErrorCode}.
 */
export class TvCommonError extends CommonError {
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
