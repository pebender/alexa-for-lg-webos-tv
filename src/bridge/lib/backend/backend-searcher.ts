import type * as dgram from "node:dgram";
import { EventEmitter } from "node:events";
import { promisify } from "node:util";
import * as arp from "node-arp";
import {
  Client as SsdpClient,
  Server as SsdpServer,
  type SsdpHeaders,
} from "node-ssdp";
import { parseString as xml2js } from "xml2js";
import * as Common from "../../../common";
import type { IP, MAC, TV, UDN } from "./tv";

export interface UPnPDevice {
  root?: {
    device?: Array<{
      manufacturer: string[];
      friendlyName: string[];
      UDN: string[];
    }>;
  };
}

export class BackendSearcher extends EventEmitter {
  private readonly _ssdpNotify: SsdpServer;
  private readonly _ssdpResponse: SsdpClient;
  public constructor(_ssdpNotify: SsdpServer, _ssdpResponse: SsdpClient) {
    super();

    this._ssdpNotify = _ssdpNotify;
    this._ssdpResponse = _ssdpResponse;
  }

  public static build(): BackendSearcher {
    const _ssdpNotify = new SsdpServer();
    const _ssdpResponse = new SsdpClient();

    const backendSearcher = new BackendSearcher(_ssdpNotify, _ssdpResponse);

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

    function ssdpProcessCallback(error: Error | null, tv: TV | null): void {
      if (error !== null) {
        backendSearcher.emit("error", error);
        return;
      }
      if (tv === null) {
        return;
      }
      backendSearcher.emit("found", tv);
    }

    async function ssdpProcessAsync(
      messageName: string,
      headers: SsdpHeaders,
      rinfo: dgram.RemoteInfo,
    ): Promise<TV | null> {
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
      // Get the IP address associated with the TV.
      if (rinfo.address === undefined) {
        return null;
      }

      const tv: {
        udn?: UDN;
        name?: string;
        ip: IP;
        url: string;
        mac?: MAC;
        key?: string;
      } = {
        ip: rinfo.address,
        url: `ws://${rinfo.address}:3000`,
      };

      //
      // Get the device description. I use this to make sure that this is an
      // LG Electronics webOS TV as well as to obtain the TV's friendly name
      // and Unique Device Name (UDN).
      //
      if (headers.LOCATION === undefined) {
        return null;
      }

      let response;
      try {
        response = await fetch(headers.LOCATION);
      } catch (error) {
        throw new Common.Error.TvCommonError({ cause: error });
      }
      if (response.status !== 200) {
        throw new Common.Error.TvCommonError({
          code: "descriptionXmlFetchError",
          message: "Could not fetch descriptionXML from the TV",
        });
      }

      let blob;
      try {
        blob = await response.blob();
      } catch (error) {
        throw new Common.Error.TvCommonError({ cause: error });
      }

      const mimetype: string[] = blob.type.split(";");
      if (mimetype[0].toLocaleLowerCase() !== "text/xml") {
        throw new Common.Error.TvCommonError({
          code: "descriptionXmlFetchError",
          message: "Could not fetch descriptionXML from the TV",
        });
      }

      let descriptionXml;
      try {
        descriptionXml = await blob.text();
      } catch (error) {
        throw new Common.Error.TvCommonError({ cause: error });
      }

      let description;
      try {
        const xml2jsWithPromise = promisify(xml2js);
        description = (await xml2jsWithPromise(descriptionXml)) as {
          root?: {
            device?: Array<{
              manufacturer?: string[];
              friendlyName?: string[];
              UDN?: string[];
            }>;
          };
        };
      } catch (error) {
        throw new Common.Error.TvCommonError({
          code: "descriptionXmlParseError",
          message: "Could not parse descriptionXML from the TV",
          cause: error,
        });
      }

      if (description === undefined || description === null) {
        throw new Common.Error.TvCommonError({
          code: "descriptionXmlParseError",
          message: "Could not parse descriptionXML from the TV",
        });
      }

      //
      // These properties are required by the UPnP specification but
      // check anyway.
      //
      if (
        description.root?.device === undefined ||
        description.root.device.length !== 1 ||
        description.root.device[0].manufacturer === undefined ||
        description.root.device[0].manufacturer.length !== 1 ||
        description.root.device[0].friendlyName === undefined ||
        description.root.device[0].friendlyName.length !== 1 ||
        description.root.device[0].UDN === undefined ||
        description.root.device[0].UDN.length !== 1
      ) {
        throw new Common.Error.TvCommonError({
          code: "descriptionXmlFormatError",
          message: "Could not fetch descriptionXML from the TV",
        });
      }

      //
      // Make sure this is from LG Electronics and has both a friendly
      // name and a UDN.
      //
      if (
        description.root.device[0].manufacturer[0].match(
          /^lg electronics$/i,
        ) !== null ||
        description.root.device[0].friendlyName[0] === "" ||
        description.root.device[0].UDN[0] === ""
      ) {
        throw new Common.Error.TvCommonError({
          code: "descriptionXmlFormatError",
          message: "Could not fetch descriptionXML from the TV",
        });
      }
      [tv.name] = description.root.device[0].friendlyName;
      [tv.udn] = description.root.device[0].UDN;

      //
      // Get the mac address needed to turn on the TV using wake on
      // lan.
      //
      try {
        const getMACWithPromise = promisify(getMAC);
        tv.mac = await getMACWithPromise(tv.ip);
      } catch (error) {
        throw new Common.Error.TvCommonError({
          code: "macAddressError",
          message: "Could not get TV's MAC address",
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
      rinfo: dgram.RemoteInfo,
      callback: (error: Common.Error.CommonError | null, tv: TV | null) => void,
    ): void {
      ssdpProcessAsync(messageName, headers, rinfo)
        .then((tv: TV | null) =>
          setImmediate((): void => {
            // eslint-disable-next-line promise/no-callback-in-promise
            callback(null, tv);
          }),
        )
        .catch((error: unknown) =>
          setImmediate((): void => {
            const commonError =
              error instanceof Common.Error.CommonError
                ? error
                : new Common.Error.TvCommonError({
                    cause: error,
                  });
            // eslint-disable-next-line promise/no-callback-in-promise
            callback(commonError, null);
          }),
        );
    }

    backendSearcher._ssdpNotify.on(
      "advertise-alive",
      (headers: SsdpHeaders, rinfo: dgram.RemoteInfo): void => {
        ssdpProcess("advertise-alive", headers, rinfo, ssdpProcessCallback);
      },
    );
    backendSearcher._ssdpResponse.on(
      "response",
      (headers: SsdpHeaders, statusCode: number, rinfo): void => {
        if (statusCode !== 200) {
          return;
        }
        ssdpProcess("response", headers, rinfo, ssdpProcessCallback);
      },
    );

    return backendSearcher;
  }

  public async start(): Promise<void> {
    // Start listening from multicast notifications from the TVs.
    try {
      await this._ssdpNotify.start();
    } catch (error) {
      throw new Common.Error.TvCommonError({ cause: error });
    }

    // Periodically search for TVs.
    const periodicSearch = (): void => {
      // Search every 1800s as that is the UPnP recommended time.
      const search = this._ssdpResponse.search(
        "urn:lge-com:service:webos-second-screen:1",
      );
      if (search instanceof Promise) {
        search.catch((error) => {
          const commonError: Common.Error.CommonError =
            new Common.Error.TvCommonError({
              code: "searchError",
              message: "TV search error",
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
        const commonError: Common.Error.CommonError =
          new Common.Error.TvCommonError({
            code: "searchError",
            message: "TV search error",
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
        const commonError: Common.Error.CommonError =
          new Common.Error.TvCommonError({
            code: "searchError",
            message: "TV search error",
            cause: error,
          });
        Common.Debug.debugError(commonError);
      });
    }
  }
}
