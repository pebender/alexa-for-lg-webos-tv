import type LGTV from "lgtv2";
import type { SsdpHeaders } from "@lvcabral/node-ssdp";
import { CommonError } from "../../../../../common";
import type { TvRecord } from "./tv-record";

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

  public readonly tv?: Partial<TvRecord>;

  public readonly lgtvRequest?: LGTV.Request;

  public readonly lgtvResponse?: LGTV.Response;

  public readonly ssdpResponse?: {
    messageName: string;
    headers: SsdpHeaders;
  };

  public readonly ssdpDescription?: string;

  constructor(options: {
    code?: TvCommonErrorCode;
    message?: string;
    tv?: Partial<TvRecord>;
    lgtvRequest?: LGTV.Request;
    lgtvResponse?: LGTV.Response;
    ssdpResponse?: {
      messageName: string;
      headers: SsdpHeaders;
    };
    ssdpDescription?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "TvCommonError";
    this.code = options.code ?? "unknown";

    this.tv = options.tv;
    this.lgtvRequest = options.lgtvRequest;
    this.lgtvResponse = options.lgtvResponse;
    this.ssdpResponse = options.ssdpResponse;
    this.ssdpDescription = options.ssdpDescription;
  }
}
