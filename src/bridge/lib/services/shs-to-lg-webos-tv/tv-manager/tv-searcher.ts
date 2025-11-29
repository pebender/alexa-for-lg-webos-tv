import { EventEmitter } from "node:events";
import { promisify } from "node:util";
import * as arp from "node-arp";
import {
  Client as SsdpClient,
  Server as SsdpServer,
  type SsdpHeaders,
} from "@lvcabral/node-ssdp";
import { parseStringPromise as xml2js } from "xml2js";
import * as Common from "../../../../../common";
import type { TvRecord } from "./tv-record";
import { TvCommonError, type TvCommonErrorCode } from "./tv-common-error";

export class TvSearcher extends EventEmitter {
  private readonly _ssdpNotify: SsdpServer;
  private readonly _ssdpResponse: SsdpClient;
  public constructor(_ssdpNotify: SsdpServer, _ssdpResponse: SsdpClient) {
    super();

    this._ssdpNotify = _ssdpNotify;
    this._ssdpResponse = _ssdpResponse;
  }

  public static build(): TvSearcher {
    const _ssdpNotify = new SsdpServer();
    const _ssdpResponse = new SsdpClient();

    const tvSearcher = new TvSearcher(_ssdpNotify, _ssdpResponse);

    /*
     * A version of node-arp's getMAC with its callback adjusted to match the
     * typical Node.js callback function structure.
     */
    function getMAC(
      ipAddress: string,
      callback: (error: Error | null, result: string) => void,
    ): void {
      arp.getMAC(ipAddress, (isError: boolean, result: string): void => {
        if (isError) {
          callback(new Error(result), "");
          return;
        }
        callback(null, result);
      });
    }

    function ssdpProcessCallback(
      error: Error | null,
      tv: TvRecord | null,
    ): void {
      if (error !== null) {
        tvSearcher.emit("error", error);
        return;
      }
      if (tv === null) {
        return;
      }
      tvSearcher.emit("found", tv);
    }

    async function ssdpProcessAsync(
      messageName: string,
      headers: SsdpHeaders,
    ): Promise<TvRecord | null> {
      const tv: Partial<TvRecord> = {};
      let descriptionXml: string;

      function createTvCommonError(options: {
        code: TvCommonErrorCode;
        message?: string;
        cause?: unknown;
      }): TvCommonError {
        return new TvCommonError({
          ...options,
          tv,
          ssdpResponse: {
            messageName,
            headers,
          },
          ssdpDescription: descriptionXml,
        });
      }

      if (headers.USN === undefined) {
        return null;
      }
      if (
        !headers.USN.endsWith("::urn:lge-com:service:webos-second-screen:1")
      ) {
        return null;
      }
      const messageTypeMap: Record<string, string> = {
        "advertise-alive": "NT",
        "advertise-bye": "NT",
        response: "ST",
      };
      if (messageTypeMap[messageName] === undefined) {
        return null;
      }
      // Make sure it is the webOS second screen service.
      if (headers[messageTypeMap[messageName]] === undefined) {
        return null;
      }
      if (
        headers[messageTypeMap[messageName]] !==
        "urn:lge-com:service:webos-second-screen:1"
      ) {
        return null;
      }
      // Make sure that if it is a advertise (NT) message then it is "ssdp:alive".
      if (
        messageTypeMap[messageName] === "NT" &&
        (headers.NTS === undefined || headers.NTS !== "ssdp:alive")
      ) {
        return null;
      }
      // Make sure it is webOS and UPnP 1.0 or 1.1.
      if (
        headers.SERVER === undefined ||
        (headers.SERVER as string).match(/^webos\/[\d.]+ upnp\/1\.[01]$/i) ===
        null
      ) {
        return null;
      }

      // Get the IP address associated with the TvRecord.
      if (headers.LOCATION === undefined) {
        return null;
      }
      const location = new URL(headers.LOCATION);
      tv.ip = location.hostname;
      tv.url = `ws://${location.hostname}:3000`;

      //
      // Get the device description. I use this to make sure that this is an
      // LG Electronics webOS TvRecord as well as to obtain the TvRecord's friendly name
      // and Unique Device Name (UDN).
      //
      let response;
      try {
        response = await fetch(headers.LOCATION);
      } catch (error) {
        throw createTvCommonError({ code: "unknown", cause: error });
      }
      if (!response.ok) {
        throw createTvCommonError({
          code: "descriptionXmlFetchError",
          message: "Could not fetch descriptionXML from the TvRecord",
        });
      }

      const contentType: string | null = response.headers.get("content-type");
      if (contentType === null) {
        throw createTvCommonError({
          code: "descriptionXmlFetchError",
          message: "Could not fetch descriptionXML from the TvRecord",
        });
      }
      const mimeType: string = contentType
        .split(/\s*;\s*/)[0]
        .trim()
        .toLowerCase();
      if (mimeType !== "text/xml") {
        throw createTvCommonError({
          code: "descriptionXmlFetchError",
          message: "Could not fetch descriptionXML from the TvRecord",
        });
      }

      try {
        descriptionXml = await response.text();
      } catch (error) {
        throw createTvCommonError({
          code: "descriptionXmlFetchError",
          message: "Could not fetch descriptionXML from the TvRecord",
          cause: error,
        });
      }

      let description;
      try {
        description = (await xml2js(descriptionXml)) as {
          root?: {
            device?: Array<{
              manufacturer?: string[];
              friendlyName?: string[];
              UDN?: string[];
            }>;
          };
        };
      } catch (error) {
        throw createTvCommonError({
          code: "descriptionXmlParseError",
          message: "Could not parse descriptionXML from the TvRecord",
          cause: error,
        });
      }

      if (description === undefined || description === null) {
        throw createTvCommonError({
          code: "descriptionXmlParseError",
          message: "Could not parse descriptionXML from the TvRecord",
        });
      }

      //
      // These properties are required by the UPnP specification but
      // check anyway.
      //
      if (
        description.root?.device?.length !== 1 ||
        description.root.device[0].manufacturer?.length !== 1 ||
        description.root.device[0].friendlyName?.length !== 1 ||
        description.root.device[0].UDN?.length !== 1
      ) {
        throw createTvCommonError({
          code: "descriptionXmlFormatError",
          message: "Could not fetch descriptionXML from the TvRecord",
        });
      }

      //
      // Make sure this is from LG Electronics and has both a friendly
      // name and a UDN.
      //
      if (
        description.root.device[0].manufacturer[0].match(
          /^lg electronics$/i,
        ) === null ||
        description.root.device[0].friendlyName[0] === "" ||
        description.root.device[0].UDN[0] === ""
      ) {
        throw createTvCommonError({
          code: "descriptionXmlFormatError",
          message: "Could not fetch descriptionXML from the TvRecord",
        });
      }
      [tv.name] = description.root.device[0].friendlyName;
      [tv.udn] = description.root.device[0].UDN;

      //
      // Get the mac address needed to turn on the TvRecord using wake on
      // lan.
      //
      try {
        const getMACWithPromise = promisify(getMAC);
        tv.mac = await getMACWithPromise(tv.ip);
      } catch (error) {
        throw createTvCommonError({
          code: "macAddressError",
          message: "Could not get TvRecord's MAC address",
          cause: error,
        });
      }
      return {
        udn: tv.udn,
        name: tv.name,
        ip: tv.ip,
        url: tv.url,
        mac: tv.mac,
        key: tv.key,
      };
    }

    function ssdpProcess(
      messageName: string,
      headers: SsdpHeaders,
      callback: (error: Common.CommonError | null, tv: TvRecord | null) => void,
    ): void {
      ssdpProcessAsync(messageName, headers)
        .then((tv: TvRecord | null) =>
          setImmediate((): void => {
            callback(null, tv);
          }),
        )
        .catch((error: unknown) =>
          setImmediate((): void => {
            const commonError =
              error instanceof Common.CommonError
                ? error
                : new TvCommonError({
                  code: "searchError",
                  message: "TvRecord search error",
                  cause: error,
                });
            callback(commonError, null);
          }),
        );
    }

    tvSearcher._ssdpNotify.on(
      "advertise-alive",
      (headers: SsdpHeaders): void => {
        ssdpProcess("advertise-alive", headers, ssdpProcessCallback);
      },
    );
    tvSearcher._ssdpResponse.on(
      "response",
      (headers: SsdpHeaders, statusCode: number, rinfo): void => {
        if (statusCode !== 200) {
          return;
        }
        ssdpProcess("response", headers, ssdpProcessCallback);
      },
    );

    return tvSearcher;
  }

  public async start(): Promise<void> {
    // Start listening from multicast notifications from the TVs.
    try {
      await this._ssdpNotify.start();
    } catch (error) {
      throw new TvCommonError({
        code: "searchError",
        message: "TvRecord search error",
        cause: error,
      });
    }

    // Periodically search for TVs.
    const periodicSearch = (): void => {
      // Search every 1800s as that is the UPnP recommended time.
      const search = this._ssdpResponse.search(
        "urn:lge-com:service:webos-second-screen:1",
      );
      Common.Debug.debug("periodicSearch");
      if (search instanceof Promise) {
        search.catch((error: unknown) => {
          const commonError: Common.CommonError = new TvCommonError({
            code: "searchError",
            message: "TvRecord search error",
            cause: error,
          });
          Common.Debug.debugError(commonError);
        });
      }
      setTimeout(periodicSearch, 1_800_000);
    };
    periodicSearch();

    // Do one immediate search.
    const search = this._ssdpResponse.search(
      "urn:lge-com:service:webos-second-screen:1",
    );
    if (search instanceof Promise) {
      search.catch((error: unknown) => {
        const commonError: Common.CommonError = new TvCommonError({
          code: "searchError",
          message: "TvRecord search error",
          cause: error,
        });
        Common.Debug.debugError(commonError);
      });
    }
  }

  public now(): void {
    const search = this._ssdpResponse.search(
      "urn:lge-com:service:webos-second-screen:1",
    );
    if (search instanceof Promise) {
      search.catch((error: unknown) => {
        const commonError: Common.CommonError = new TvCommonError({
          code: "searchError",
          message: "TvRecord search error",
          cause: error,
        });
        Common.Debug.debugError(commonError);
      });
    }
  }
}
