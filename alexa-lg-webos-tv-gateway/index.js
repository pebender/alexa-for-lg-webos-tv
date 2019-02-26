/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */

const fs = require("fs-extra");
const Datastore = require("nedb");
const ppath = require("persist-path");
const LGTV = require("./lib/lgtv");
const ServerSecurity = require("./lib/server/server-security");
const ServerInternal = require("./lib/server/server-internal");
const ServerExternal = require("./lib/server/server-external");

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

/*
 * This operation is synchronous. It is both expected and desired because it
 * occures once at startup and because the database is needed before the LG
 * webOS TV gateway can run.
 */
const serverDb = new Datastore({"filename": `${configurationDir}/http.nedb`});
serverDb.loadDatabase((error) => {
    if (error) {
        throw error;
    }
});
serverDb.ensureIndex({"fieldName": "name",
    "unique": true});

/*
 * This operation is synchronous. It is both expected and desired because it
 * occures once at startup and because the database is needed before the LG
 * webOS TV gateway can run.
 */
const lgtvDb = new Datastore({"filename": `${configurationDir}/lgtv.nedb`});
lgtvDb.loadDatabase((error) => {
    if (error) {
        throw error;
    }
});
lgtvDb.ensureIndex({"fieldName": "udn",
    "unique": true});

const serverSecurity = new ServerSecurity(serverDb);

const lgtv = new LGTV(lgtvDb);
lgtv.on("error", (error) => {
    console.log(error);
});
lgtv.initialize();

const serverInternal = new ServerInternal(serverSecurity);
serverInternal.start();

const serverExternal = new ServerExternal(lgtv, serverSecurity);
serverExternal.start();