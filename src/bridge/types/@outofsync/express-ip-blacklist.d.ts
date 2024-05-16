import type ObjectKeyCache from "@outofsync/object-key-cache";
import type MemoryCache from "@outofsync/memory-cache";
import type Redis from "redis";
import type express from "express";

declare module "@outofsync/express-ip-blacklist" {
  type IPBlacklistLookupFn = (req: express.Request) => string[];
  type IPBlacklistWhiteListFn = (req: express.Request) => string[] | boolean;
  type IPBlacklistOnBlacklistFn = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  type Cache = typeof ObjectKeyCache | typeof MemoryCache | typeof Redis;

  interface IPBlacklistOptions {
    lookup?: IPBlacklistLookupFn | string[];
    count?: number;
    expire?: number;
    whitelist?: IPBlacklistWhiteListFn;
    onBlacklist?: IPBlacklistOnBlacklistFn | null;
    noip?: boolean;
  }

  declare class IPBlacklist {
    constructor(
      namespace: string,
      config?: IPBlacklistOptions,
      cache?: Cache,
      log?: unknown,
    );

    increment(
      req: express.Request,
      res: express.Response,
      next?: express.NextFunction,
    ): void;

    checkBlacklist(
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void;
  }

  export default IPBlacklist;
}
