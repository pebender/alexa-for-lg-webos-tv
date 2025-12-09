export type UDN = string;
export type IPv4 = string;
export type IPv6 = string;
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents -- Defining IP in terms of IPv4 and IPv6 is more clear.
export type IP = IPv4 | IPv6;
export type MAC = string;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- This is a type because we are using it as a type for DatabaseTable.
export type TvRecord = {
  udn: UDN;
  name: string;
  ip: IP;
  url: string;
  mac: MAC;
  key?: string;
};
