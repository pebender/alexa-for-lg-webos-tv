/* eslint-disable unicorn/prevent-abbreviations */
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
