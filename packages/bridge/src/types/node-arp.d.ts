/* eslint-disable unicorn/prevent-abbreviations -- The function parameters are defined by the node-arp */
declare module "node-arp" {
  export function getMAC(
    ipaddress: string,
    cb: (found: boolean, result: string) => void,
  ): void;

  export function getMACLinux(
    ipaddress: string,
    cb: (found: boolean, result: string) => void,
  ): void;

  export function getMACWindows(
    ipaddress: string,
    cb: (found: boolean, result: string) => void,
  ): void;

  export function getMACMac(
    ipaddress: string,
    cb: (found: boolean, result: string) => void,
  ): void;
}
