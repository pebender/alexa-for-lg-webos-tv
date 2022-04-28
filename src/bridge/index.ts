/**
 * # Code Structure
 *
 * The bridge implements the mapping from Alexa Smart Home Skill messages to LG
 * webOS TV messages in three parts:
 *
 * - frontend,
 * - middle, and
 * - backend.
 *
 * The frontend handles the communication link between the skill and the bridge.
 * It implements the web server that receives and transmits skill directives,
 * events and contexts. In addition, it handles the establishment of secure
 * communication between the skill and the bridge.
 *
 * The middle handles the translation between the skill communication protocol
 * and the LG webOS TV protocol.
 *
 * The backend handles the communication link between the bridge and the LG
 * webOS TV.
 */

import * as Common from "../common";
import { Backend } from "./lib/backend";
import { Configuration } from "./lib/configuration";
import { Frontend } from "./lib/frontend";
import { Middle } from "./lib/middle";
import * as fs from "fs/promises";
const persistPath = require("persist-path");

export async function startBridge(): Promise<void> {
  const configurationDir = persistPath(Common.constants.application.name.safe);

  try {
    await fs.mkdir(configurationDir, { recursive: true });
  } catch (error) {
    Common.Debug.debugErrorWithStack(error);
    throw Error;
  }

  const configuration = await Configuration.build();

  //
  // I keep long term information needed to connect to each TV in a database.
  // The long term information is the TV's unique device name (udn), friendly name
  // (name), Internet Protocol address (ip), media access control address (mac)
  // and client key (key).
  //

  const backend = await Backend.build(configuration);
  backend.on("error", (error: Error, id: string): void => {
    Common.Debug.debug(id);
    Common.Debug.debugErrorWithStack(error);
  });
  const middle = await Middle.build(configuration, backend);
  const frontend = await Frontend.build(configuration, middle);
  await frontend.start();
  await backend.start();
}
