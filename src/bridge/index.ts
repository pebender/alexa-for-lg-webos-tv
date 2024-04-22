/**
 * # Code Structure
 *
 * The bridge implements the mapping from Alexa Smart Home Skill messages to LG
 * webOS TV messages in three parts:
 *
 * - [frontend](#frontend),
 * - [middle](#middle), and
 * - [backend](#backend).
 *
 * ## Frontend
 *
 * The frontend handles the communication link between the bridge and the skill.
 * It is an HTTP server that maintains three path-differentiated communication
 * links: an authorization link for skill and email address authorization, a
 * test link for testing whether or not the skill and email address are
 * currently authorized and a Alexa Smart Home Skill link for sending Alexa
 * Smart Home Skill messages.
 *
 * The frontend uses a bearer token to authorize HTTP messages sent on the test
 * link and the Alexa Smart Home Skill link.
 *
 * The frontend uses the authorization link to authorize the skill and the email
 * address and to establish the bearer token. The skill sends a JWT containing
 * the bridge hostname and the email address and signed by the skill. The bridge
 * verifies the JWT, checks that the email address is authorized and creates the
 * bearer token. TODO: verify that the bridge hostname in the JWT matches the
 * bridge's hostname.
 *
 * ## Middle
 *
 * The middle handles the translation between the Smart Home Skill communication
 * protocol and the LG webOS TV protocol.
 *
 * The middle authorizes the Alexa Smart Home Skill messages by validating that
 * the bearer token in each message belongs to an email address that is
 * authorized to use the bridge. TODO: verify that the email address associated
 * with the Alexa Smart Home Skill message matches the email address associated
 * with the HTTP message that transported the Alexa Smart Home Skill message.
 *
 * ## Backend
 *
 * The backend handles the communication link between the bridge and the LG
 * webOS TV.
 *
 * @packageDocumentation
 */

import * as Common from "../common";
import { Backend } from "./lib/backend";
import { Configuration } from "./lib/configuration";
import { Frontend } from "./lib/frontend";
import { Middle } from "./lib/middle";
import * as fs from "fs/promises";
const persistPath = require("persist-path");

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
    } catch (error) {
      Common.Debug.debugErrorWithStack(error);
      throw Error;
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
      Common.Debug.debugErrorWithStack(error);
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
    await this._frontend.start();
    await this._backend.start();
  }
}

/**
 * A convenience function to build and start the Bridge.
 */
export async function startBridge(): Promise<void> {
  const bridge = await Bridge.build();
  await bridge.start();
}
