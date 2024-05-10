import ObjectKeyCache from "@outofsync/object-key-cache";
import MemoryCache from "@outofsync/memory-cache";
import Redis from "redis";
import express from "express";

declare module "@outofsync/express-ip-blacklist" {
  type ClosureFn = (...params: any) => void;
  type IPBlacklistLookupFn = (req: express.Request) => string[];
  type IPBlacklistWhiteListFn = (req: express.Request) => string[] | boolean;
  type IPBlacklistOnBlacklistFn = (
    req: express.Request,
    res: express.Response,
    next: ClosureFn,
  ) => any;
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
      log?: any,
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
