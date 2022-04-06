export type UDN = string;
export type IPv4 = string;
export type IPv6 = string;
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
