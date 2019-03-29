/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */

import {Backend} from "./lib/backend";
import {DatabaseTable} from "./lib/database";
import {Frontend} from "./lib/frontend";
import fs from "fs-extra";
const ppath = require("persist-path");

let configurationDir = null;
let backend = null;
let backendDb = null;
let frontend = null;
let frontendDb = null;

export async function startGateway(): Promise<void> {

    /*
     * This operation is synchronous. It is both expected and desired because it
     * occures once at startup and because the directory is needed before the LG
     * webOS TV gateway can run.
     */
    configurationDir = ppath("LGwebOSTVGateway");
    try {

        // eslint-disable-next-line no-sync
        fs.mkdirSync(configurationDir);
    } catch (error) {
        if (error.code !== "EEXIST") {
            throw error;
        }
    }

    /*
     * I keep long term information needed to connect to each TV in a database.
     * The long term information is the TV's unique device name (udn), friendly name
     * (name), Internet Protocol address (ip), media access control address (mac)
     * and client key (key).
     */
    backendDb = new DatabaseTable(configurationDir, "backend", ["udn"], "udn");
    await backendDb.initialize();
    frontendDb = new DatabaseTable(configurationDir, "frontend", ["username"], "username");
    await frontendDb.initialize();
    backend = new Backend(backendDb);
    backend.on("error", (error: Error, id: string) => {
        console.log(id);
        console.log(error);
    });
    await backend.initialize();
    frontend = new Frontend(frontendDb, backend);
    await frontend.initialize();
    await frontend.start();
    await backend.start();
}
