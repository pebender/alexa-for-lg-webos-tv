import * as fs from "node:fs/promises";
import persistPath from "persist-path";
import * as Common from "../common";
import { Frontend, type Application } from "./lib/link";
import * as ShsToLgWeboOsTv from "./lib/services/shs-to-lg-webos-tv";

export { TvManager, type TvRecord } from "./lib/services/shs-to-lg-webos-tv";
export { Frontend } from "./lib/link";

/**
 * A class to build and start a bridge.
 *
 * A new instance of Bridge is created/built by calling {@link Bridge.build}().
 *
 * @example
 * Build and start a bridge:
 *
 * ```ts
 * const bridge = await Bridge.build();
 * await bridge.start();
 * ```
 */
export class Bridge {
  private readonly _frontend: Frontend;
  private readonly _services: Record<string, Application>;
  /**
   * The constructor is private. To create a Bridge, call {@link Bridge.build}().
   */
  private constructor(
    _frontend: Frontend,
    _services: Record<string, Application>,
  ) {
    this._frontend = _frontend;
    this._services = _services;
  }

  /**
   * Builds the Bridge. When called, it
   *
   * - ensures the Configuration directory exists,
   * - retrieves the Configuration,
   * - builds a Backend using the retrieved Configuration,
   * - builds a Middle using the retrieved Configuration and the built Backend,
   * - builds a Frontend using the retrieved Configuration and the built Middle,
   * - builds a Bridge containing the retrieved Configuration, the built
   *   Backend, the built Middle and the built Frontend, and
   * - returns the built bridge.
   *
   * @returns the Bridge built
   */
  public static async build(): Promise<Bridge> {
    const configurationDirectory = persistPath(
      Common.constants.application.name.safe,
    );

    try {
      await fs.mkdir(configurationDirectory, { recursive: true });
    } catch (error) {
      const commonError: Common.CommonError = new Common.GeneralCommonError({
        cause: error,
      });
      throw commonError;
    }

    //
    // I keep long term information needed to connect to each TV in a database.
    // The long term information is the TV's unique device name (udn), friendly name
    // (name), Internet Protocol address (ip), media access control address (mac)
    // and client key (key).
    //

    const _services: Record<string, Application> = {};

    {
      const service = "shs-to-lg-webos-tv";
      const serviceConfigurationDirectory = `${configurationDirectory}/services/${service}`;
      try {
        await fs.mkdir(serviceConfigurationDirectory, { recursive: true });
      } catch (error) {
        const commonError: Common.CommonError = new Common.GeneralCommonError({
          cause: error,
        });
        throw commonError;
      }
      const _service = await ShsToLgWeboOsTv.getApplication(
        serviceConfigurationDirectory,
      );
      _services[Common.constants.bridge.path.service] = _service;
    }

    const _frontend = await Frontend.build(configurationDirectory, _services);

    const bridge = new Bridge(_frontend, _services);

    return bridge;
  }

  /**
   * Starts the Bridge. When called, it
   *
   * - starts the Frontend, and
   * - starts each Service.
   */
  public async start(): Promise<void> {
    this._frontend.start();
    for (const [, value] of Object.entries(this._services)) {
      await value.start();
    }
  }
}

/**
 * A convenience function to build and start the Bridge.
 */
export async function startBridge(): Promise<void> {
  try {
    const bridge = await Bridge.build();
    await bridge.start();
  } catch (error) {
    Common.Debug.debugError(error);
  }
}
