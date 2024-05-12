import * as dgram from "node:dgram";
import { IP, MAC, TV, UDN } from "./tv";
import * as Common from "../../../common";
import * as arp from "node-arp";
import {
  Client as SsdpClient,
  Server as SsdpServer,
  SsdpHeaders,
} from "node-ssdp";
import { EventEmitter } from "node:events";
import { parseString as xml2js } from "xml2js";

export interface UPnPDevice {
  root?: {
    device?: {
      manufacturer: string[];
      friendlyName: string[];
      UDN: string[];
    }[];
  };
}

export class BackendSearcher extends EventEmitter {
  private _ssdpNotify: SsdpServer;
  private _ssdpResponse: SsdpClient;
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
      if (error) {
        backendSearcher.emit("error", error);
        return;
      }
      if (!tv) {
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
      if (typeof headers.USN === "undefined") {
        callback(null, null);
        return;
      }
      if (
        !headers.USN.endsWith("::urn:lge-com:service:webos-second-screen:1")
      ) {
        callback(null, null);
        return;
      }
      const messageTypeMap: { [name: string]: string } = {
        "advertise-alive": "NT",
        "advertise-bye": "NT",
        response: "ST",
      };
      if (typeof messageTypeMap[messageName] === "undefined") {
        callback(null, null);
        return;
      }
      // Make sure it is the webOS second screen service.
      if (typeof headers[messageTypeMap[messageName]] === "undefined") {
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
        (typeof headers.NTS === "undefined" || headers.NTS !== "ssdp:alive")
      ) {
        callback(null, null);
        return;
      }
      // Make sure it is webOS and UPnP 1.0 or 1.1.
      if (
        typeof headers.SERVER === "undefined" ||
        !(headers.SERVER as string).match(/^WebOS\/[\d.]+ UPnP\/1\.[01]$/i)
      ) {
        callback(null, null);
        return;
      }
      // Get the IP address associated with the TV.
      if (typeof rinfo.address === "undefined") {
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
      if (typeof headers.LOCATION === "undefined") {
        callback(null, null);
        return;
      }
      void fetch(headers.LOCATION)
        .then((response: Response): Promise<Blob> => {
          if (response.status !== 200) {
            throw Common.Error.create(
              "Could not fetch descriptionXML from the TV",
              { general: "tv", specific: "descriptionXmlFetchError" },
            );
          }
          return response.blob();
        })
        .then((blob: Blob) => {
          const mimetype: string[] = blob.type.split(";");
          if (mimetype[0].toLocaleLowerCase() !== "text/xml") {
            throw Common.Error.create(
              "Could not fetch descriptionXML from the TV",
              { general: "tv", specific: "descriptionXmlFetchError" },
            );
          }
          return blob.text();
        })
        .then((descriptionXml: string): void => {
          xml2js(
            descriptionXml,
            (error: Error | null, description: UPnPDevice): void => {
              if (error !== null) {
                const commonError = Common.Error.create(
                  "Could not fetch descriptionXML from the TV",
                  {
                    general: "tv",
                    specific: "descriptionXmlFetchError",
                    cause: error,
                  },
                );
                callback(commonError, null);
                return;
              }
              if (!description) {
                callback(null, null);
                return;
              }

              //
              // These properties are required by the UPnP specification but
              // check anyway.
              //
              if (
                typeof description.root === "undefined" ||
                typeof description.root.device === "undefined" ||
                description.root.device.length !== 1 ||
                typeof description.root.device[0].manufacturer ===
                  "undefined" ||
                description.root.device[0].manufacturer.length !== 1 ||
                typeof description.root.device[0].friendlyName ===
                  "undefined" ||
                description.root.device[0].friendlyName.length !== 1 ||
                typeof description.root.device[0].UDN === "undefined" ||
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
                !description.root.device[0].manufacturer[0].match(
                  /^LG Electronics$/i,
                ) ||
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
                  const error = Common.Error.create(
                    "Could not get TV's MAC address",
                    {
                      general: "tv",
                      specific: "macAddressError",
                      cause: result,
                    },
                  );
                  callback(error, null);
                  return;
                }
                tv.mac = result;
                callback(null, tv as TV);
                // eslint-disable-next-line no-useless-return
                return;
              });
            },
          );
        })
        .catch((reason: unknown) => {
          if (reason instanceof Common.Error.CommonError) {
            callback(reason, null);
          } else {
            const error = Common.Error.create("", {
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
    } catch (error) {
      throw Common.Error.create("", { general: "unknown", cause: error });
    }

    // Periodically search for TVs.
    const periodicSearch = (): void => {
      // Search every 1800s as that is the UPnP recommended time.
      const search = this._ssdpResponse.search(
        "urn:lge-com:service:webos-second-screen:1",
      );
      if (search instanceof Promise) {
        search.catch((reason: unknown) => {
          const error: Common.Error.CommonError = Common.Error.create(
            "TV search error",
            { general: "tv", specific: "searchError", cause: reason },
          );
          Common.Debug.debugErrorWithStack(error);
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
        const error: Common.Error.CommonError = Common.Error.create(
          "TV search error",
          { general: "tv", specific: "searchError", cause: reason },
        );
        Common.Debug.debugErrorWithStack(error);
      });
    }
  }

  public now(): void {
    const search = this._ssdpResponse.search(
      "urn:lge-com:service:webos-second-screen:1",
    );
    if (search instanceof Promise) {
      search.catch((reason: unknown) => {
        const error: Common.Error.CommonError = Common.Error.create(
          "TV search error",
          { general: "tv", specific: "searchError", cause: reason },
        );
        Common.Debug.debugErrorWithStack(error);
      });
    }
  }
}
