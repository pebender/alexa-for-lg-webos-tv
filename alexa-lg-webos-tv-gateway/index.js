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
const LGTV = require("./lib/lgtv");
const Server = require("./lib/server");

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

const serverDb = new DatabaseTable(configurationDir, "server", ["username"], "username");
serverDb.initialize((error) => {
    if (error) {
        throw error;
    }
});

const lgtvDb = new DatabaseTable(configurationDir, "lgtv", ["udn"], "udn");
lgtvDb.initialize((error) => {
    if (error) {
        throw error;
    }
});

const lgtv = new LGTV(lgtvDb);
const server = new Server(serverDb, lgtv);

lgtv.on("error", (error, id) => {
    console.log(id);
    console.log(error);
});

lgtv.initialize().
    then(() => {
        lgtv.start();
        return server.initialize();
    }).
    then(() => {
        server.start();
    }).
    catch((error) => {
        throw error;
    });