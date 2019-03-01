/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */

const fs = require("fs-extra");
const ppath = require("persist-path");
const DatabaseTable = require("./lib/database");
const Backend = require("./lib/backend");
const Frontend = require("./lib/frontend");

/*
 * I keep long term information needed to connect to each TV in a database.
 * The long term information is the TV's unique device name (udn), friendly name
 * (name), Internet Protocol address (ip), media access control address (mac)
 * and client key (key).
 */
const configurationDir = ppath("LGwebOSTVGateway");
try {

    /*
     * This operation is synchronous. It is both expected and desired because it
     * occures once at startup and because the directory is needed before the LG
     * webOS TV gateway can run.
     */
    // eslint-disable-next-line no-sync
    fs.mkdirSync(configurationDir);
} catch (error) {
    if (error.code !== "EEXIST") {
        throw error;
    }
}

const frontendDb = new DatabaseTable(configurationDir, "frontend", ["username"], "username");
frontendDb.initialize((error) => {
    if (error) {
        throw error;
    }
});

const backendDb = new DatabaseTable(configurationDir, "backend", ["udn"], "udn");
backendDb.initialize((error) => {
    if (error) {
        throw error;
    }
});

const backend = new Backend(backendDb);
const frontend = new Frontend(frontendDb, backend);

backend.on("error", (error, id) => {
    console.log(id);
    console.log(error);
});

backend.initialize().
    then(() => {
        backend.start();
        return frontend.initialize();
    }).
    then(() => {
        frontend.start();
    }).
    catch((error) => {
        throw error;
    });