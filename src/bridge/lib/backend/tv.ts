export type UDN = string;
export type IPv4 = string;
export type IPv6 = string;
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
export type IP = IPv4 | IPv6;
export type MAC = string;

/* This is a type because we are using it as a type for DatabaseTable. */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TV = {
  udn: UDN;
  name: string;
  ip: IP;
  url: string;
  mac: MAC;
  key?: string;
};
