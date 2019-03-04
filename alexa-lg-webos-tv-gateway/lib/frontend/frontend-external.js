/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */

const express = require("express");
const basicAuth = require("express-basic-auth");
const {Mutex} = require("async-mutex");
const {UnititializedClassError} = require("../common");

const mutex = new Mutex();

class ServerExternal {
    constructor(serverSecurity, backend) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.security = serverSecurity;
        that.private.backend = backend;
        that.private.server = null;
    }

    initialize() {
        const that = this;
        return mutex.runExclusive(initializeHandler);
        function initializeHandler() {
            return new Promise((resolve) => {
                if (that.private.initialized === true) {
                    resolve();
                    return;
                }

                that.private.server = express();
                that.private.server.use("/", express.json());
                that.private.server.use("/HTTP", basicAuth({"authorizer": authorizeRoot}));
                that.private.server.post("/HTTP", httpHandler);
                that.private.server.use("/LGTV", basicAuth({"authorizer": authorizeUser}));
                that.private.server.post("/LGTV/RUN", backendRunHandler);
                that.private.server.post("/LGTV/SKILL", backendSkillHandler);
                that.private.server.get("/LGTV/PING", backendPingHandler);
                that.private.server.post("/", (request, response) => {
                    response.status(401).end();
                });
                that.private.initialized = true;
                resolve();
            });

            async function authorizeRoot(username, password) {
                const valid = await that.private.security.authorizeRoot(username, password);
                return valid;
            }

            async function authorizeUser(username, password) {
                const valid = await that.private.security.authorizeUser(username, password);
                return valid;
            }

            function httpHandler(request, response) {
                if (Reflect.has(request.body, "command") && request.body.command.name === "passwordSet") {
                    that.private.security.userPasswordIsNull().
                    then((isNull) => {
                        let body = {};
                        if (isNull) {
                            that.private.security.setUserPassword(request.body.command.value).
                            then(() => {
                                body = {};
                            }).
                            catch((error) => {
                                body = {
                                    "error": {
                                        "name": error.name,
                                        "message": error.message
                                    }
                                };
                            });
                        } else {
                            body = {
                                "error": {
                                    "message": "The password is already set."
                                }
                            };
                        }
                        return body;
                    }).
                    then((body) => {
                        response.
                        type("json").
                        status(200).
                        json(body).
                        end();
                    });
                } else {
                    response.
                        status(400).
                        end();
                }
            }

            function backendRunHandler(request, response) {
                return that.private.backend.runCommand(request.body).
                    then((res) => {
                        response.
                            type("json").
                            status(200).
                            json(res).
                            end();
                    }).
                    catch((error) => {
                        throw error;
                    });
            }

            function backendSkillHandler(request, response) {
                if (Reflect.has(request.body, "log")) {
                    console.log(JSON.stringify(request.body, null, 2));
                    response.
                        type("json").
                        status(200).
                        json({}).
                        end();
                    return Promise.resolve();
                }
//console.log(JSON.stringify(request.body, null, 2));
                return that.private.backend.skillCommand(request.body).
                    then((res) => {
// console.log(JSON.stringify(res, null, 2));
                        response.
                            type("json").
                            status(200).
                            json(res).
                            end();
                    }).
                    catch((error) => {
                        throw error;
                    });
            }

            function backendPingHandler(request, response) {
                response.
                    status(200).
                    end();
            }
        }
    }

    start() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("ServerExternal", "start");
        }

        that.private.server.listen(25391, "localhost");
    }
}

module.exports = ServerExternal;