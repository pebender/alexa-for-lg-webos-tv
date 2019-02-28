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
const {UnititializedClassError} = require("../common");

class ServerExternal {
    constructor(serverSecurity, lgtv) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.initializing = false;
        that.private.security = serverSecurity;
        that.private.lgtv = lgtv;
        that.private.server = null;
    }

    initialize() {
        const that = this;
        return new Promise((resolve) => {
            if (that.private.initializing === true) {
                resolve();
                return;
            }
            that.private.initializing = true;

            if (that.private.initialized === true) {
                that.private.initializing = false;
                resolve();
                return;
            }

            that.private.server = express();
            that.private.server.use("/", express.json());
            that.private.server.use("/HTTP", basicAuth({"authorizer": authorizeRoot}));
            that.private.server.post("/HTTP", httpHandler);
            that.private.server.use("/LGTV", basicAuth({"authorizer": authorizeUser}));
            that.private.server.post("/LGTV/RUN", lgtvRunHandler);
            that.private.server.post("/LGTV/SKILL", lgtvSkillHandler);
            that.private.server.get("/LGTV/PING", lgtvPingHandler);
            that.private.server.post("/", (request, response) => {
                response.status(401).end();
            });
            that.private.initialized = true;
            that.private.initializing = false;
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
                    if (isNull) {
                        that.private.security.setUserPassword(request.body.command.value).
                        then(() => {
                            const body = {};
                            response.
                                type("json").
                                status(200).
                                json(body).
                                end();
                        }).
                        catch((error) => {
                            const body = {
                                "error": {
                                    "name": error.name,
                                    "message": error.message
                                }
                            };
                            response.
                                type("json").
                                status(200).
                                json(body).
                                end();
                        });
                    } else {
                        const body = {
                            "error": {
                                "message": "The password is already set."
                            }
                        };
                        response.
                            type("json").
                            status(200).
                            json(body).
                            end();
                    }
                });
            } else {
                response.
                    status(400).
                    end();
            }
        }

        function lgtvRunHandler(request, response) {
            return that.private.lgtv.runCommand(request.body).
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

        function lgtvSkillHandler(request, response) {
            return that.private.lgtv.skillCommand(request.body).
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


        function lgtvPingHandler(request, response) {
            response.
                status(200).
                end();
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