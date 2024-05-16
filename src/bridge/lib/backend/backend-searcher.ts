import type * as dgram from "node:dgram";
import { EventEmitter } from "node:events";
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

    function ssdpProcess(
      messageName: string,
      headers: SsdpHeaders,
      rinfo: dgram.RemoteInfo,
      callback: (error: Common.Error.CommonError | null, tv: TV | null) => void,
    ): void {
      if (headers.USN === undefined) {
        callback(null, null);
        return;
      }
      if (
        !headers.USN.endsWith("::urn:lge-com:service:webos-second-screen:1")
      ) {
        callback(null, null);
        return;
      }
      const messageTypeMap: Record<string, string> = {
        "advertise-alive": "NT",
        "advertise-bye": "NT",
        response: "ST",
      };
      if (messageTypeMap[messageName] === undefined) {
        callback(null, null);
        return;
      }
      // Make sure it is the webOS second screen service.
      if (headers[messageTypeMap[messageName]] === undefined) {
        callback(null, null);
        return;
      }
      if (
        headers[messageTypeMap[messageName]] !==
        "urn:lge-com:service:webos-second-screen:1"
      ) {
        callback(null, null);
        return;
      }
      // Make sure that if it is a advertise (NT) message then it is "ssdp:alive".
      if (
        messageTypeMap[messageName] === "NT" &&
        (headers.NTS === undefined || headers.NTS !== "ssdp:alive")
      ) {
        callback(null, null);
        return;
      }
      // Make sure it is webOS and UPnP 1.0 or 1.1.
      if (
        headers.SERVER === undefined ||
        (headers.SERVER as string).match(/^webos\/[\d.]+ upnp\/1\.[01]$/i) ===
          null
      ) {
        callback(null, null);
        return;
      }
      // Get the IP address associated with the TV.
      if (rinfo.address === undefined) {
        callback(null, null);
        return;
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
        callback(null, null);
        return;
      }
      void fetch(headers.LOCATION)
        .then(async (response: Response): Promise<Blob> => {
          if (response.status !== 200) {
            throw Common.Error.create({
              message: "Could not fetch descriptionXML from the TV",
              general: "tv",
              specific: "descriptionXmlFetchError",
            });
          }
          return await response.blob();
        })
        .then(async (blob: Blob) => {
          const mimetype: string[] = blob.type.split(";");
          if (mimetype[0].toLocaleLowerCase() !== "text/xml") {
            throw Common.Error.create({
              message: "Could not fetch descriptionXML from the TV",
              general: "tv",
              specific: "descriptionXmlFetchError",
            });
          }
          return await blob.text();
        })
        .then((descriptionXml: string): void => {
          xml2js(
            descriptionXml,
            (error: Error | null, description?: UPnPDevice | null): void => {
              if (error !== null) {
                const commonError = Common.Error.create({
                  message: "Could not fetch descriptionXML from the TV",
                  general: "tv",
                  specific: "descriptionXmlFetchError",
                  cause: error,
                });
                callback(commonError, null);
                return;
              }
              if (description === undefined || description === null) {
                callback(null, null);
                return;
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
                callback(null, null);
                return;
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
                callback(null, null);
                return;
              }
              [tv.name] = description.root.device[0].friendlyName;
              [tv.udn] = description.root.device[0].UDN;

              //
              // Get the mac address needed to turn on the TV using wake on
              // lan.
              //
              arp.getMAC(tv.ip, (isError: boolean, result: string): void => {
                if (isError) {
                  const error = Common.Error.create({
                    message: "Could not get TV's MAC address",
                    general: "tv",
                    specific: "macAddressError",
                    cause: result,
                  });
                  callback(error, null);
                  return;
                }
                tv.mac = result;
                callback(null, tv as TV);
              });
            },
          );
        })
        .catch((reason: unknown) => {
          if (reason instanceof Common.Error.CommonError) {
            callback(reason, null);
          } else {
            const error = Common.Error.create({
              general: "tv",
              cause: reason,
            });
            callback(error, null);
          }
        });
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
    } catch (cause) {
      throw Common.Error.create({ cause });
    }

    // Periodically search for TVs.
    const periodicSearch = (): void => {
      // Search every 1800s as that is the UPnP recommended time.
      const search = this._ssdpResponse.search(
        "urn:lge-com:service:webos-second-screen:1",
      );
      if (search instanceof Promise) {
        search.catch((reason: unknown) => {
          const error: Common.Error.CommonError = Common.Error.create({
            message: "TV search error",
            general: "tv",
            specific: "searchError",
            cause: reason,
          });
          Common.Debug.debugError(error);
        });
      }
      setTimeout(periodicSearch, 1800000);
    };
    periodicSearch();

    // Do one immediate search.
    const search = this._ssdpResponse.search(
      "urn:lge-com:service:webos-second-screen:1",
    );
    if (search instanceof Promise) {
      search.catch((reason: unknown) => {
        const error: Common.Error.CommonError = Common.Error.create({
          message: "TV search error",
          general: "tv",
          specific: "searchError",
          cause: reason,
        });
        Common.Debug.debugError(error);
      });
    }
  }

  public now(): void {
    const search = this._ssdpResponse.search(
      "urn:lge-com:service:webos-second-screen:1",
    );
    if (search instanceof Promise) {
      search.catch((reason: unknown) => {
        const error: Common.Error.CommonError = Common.Error.create({
          message: "TV search error",
          general: "tv",
          specific: "searchError",
          cause: reason,
        });
        Common.Debug.debugError(error);
      });
    }
  }
}
