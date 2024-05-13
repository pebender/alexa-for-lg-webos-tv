import * as Common from "../common";
import { Backend } from "./lib/backend";
import { Configuration } from "./lib/configuration";
import { Frontend } from "./lib/frontend";
import { Middle } from "./lib/middle";
import * as fs from "fs/promises";
import persistPath from "persist-path";

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
  private readonly _configuration: Configuration;
  private readonly _backend: Backend;
  private readonly _middle: Middle;
  private readonly _frontend: Frontend;
  /**
   * The constructor is private. To create a Bridge, call {@link Bridge.build}().
   */
  private constructor(
    _configuration: Configuration,
    _backend: Backend,
    _middle: Middle,
    _frontend: Frontend,
  ) {
    this._configuration = _configuration;
    this._backend = _backend;
    this._middle = _middle;
    this._frontend = _frontend;
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
  public static async build() {
    const configurationDir = persistPath(
      Common.constants.application.name.safe,
    );

    try {
      await fs.mkdir(configurationDir, { recursive: true });
    } catch (cause) {
      const error = Common.Error.create("", { general: "unknown", cause });
      Common.Debug.debugError(error);
      throw error;
    }

    const _configuration = await Configuration.build();

    //
    // I keep long term information needed to connect to each TV in a database.
    // The long term information is the TV's unique device name (udn), friendly name
    // (name), Internet Protocol address (ip), media access control address (mac)
    // and client key (key).
    //

    const _backend = await Backend.build(_configuration);
    _backend.on("error", (error: Error, id: string): void => {
      Common.Debug.debug(id);
      Common.Debug.debugError(error);
    });
    const _middle = await Middle.build(_configuration, _backend);
    const _frontend = await Frontend.build(_configuration, _middle);

    const bridge = new Bridge(_configuration, _backend, _middle, _frontend);

    return bridge;
  }

  /**
   * Starts the Bridge. When called, it
   *
   * - starts the Frontend, and
   * - starts the Backend.
   */
  public async start(): Promise<void> {
    this._frontend.start();
    await this._backend.start();
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
