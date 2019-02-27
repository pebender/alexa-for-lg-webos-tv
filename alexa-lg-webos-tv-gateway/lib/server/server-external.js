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
const {constants} = require("alexa-lg-webos-tv-common");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");
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

    initialize(callback) {
        if (this.private.initializing === true) {
            callback(null);
            return;
        }
        this.private.initializing = true;

        const that = this;

        if (that.private.initialized === true) {
            that.private.initializing = false;
            callback(null);
            return;
        }

        that.private.server = express();

        that.private.server.use("/", express.json());
        that.private.server.use("/HTTP", basicAuth({"authorizer": requestAuthorizeHTTP}));
        function requestAuthorizeHTTP(username, password) {
            if (username === "HTTP" && password === constants.password) {
                return true;
            }
            return false;
        }
        that.private.server.post("/HTTP", (request, response) => {
            if (Reflect.has(request.body, "command") && request.body.command.name === "passwordSet") {
                if (that.private.security.password === null) {
                    that.private.security.password = request.body.command.value;
                    response.
                        type("json").
                        status(200).
                        json({}).
                        end();
                } else {
                    const body = {
                        "error": {
                            "message": "Gateway's password is already set."
                        }
                    };
                    response.
                        type("json").
                        status(200).
                        json(body).
                        end();
                }
            } else {
                response.status(400).end();
            }
        });
        that.private.server.use("/LGTV", basicAuth({"authorizer": requestAuthorizeLGTV}));
        function requestAuthorizeLGTV(username, password) {
        //    if (username === that.private.security.username && password === that.private.security.password) {
            if (username === that.private.security.username && password === "0") {
                return true;
            }
            return false;
        }
        that.private.server.post("/LGTV/RUN", (request, response) => {
            that.private.lgtv.controller.runCommand(request.body).
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
        });
        that.private.server.post("/LGTV/SKILL", (request, response) => {
        console.log(JSON.stringify(request.body, null, 2));
            that.private.lgtv.controller.skillCommand(request.body).
                then((res) => {
        console.log(JSON.stringify(res, null, 2));
                    response.
                        type("json").
                        status(200).
                        json(res).
                        end();
                }).
                catch((error) => {
                    throw error;
                });
        });
        that.private.server.get("/LGTV/PING", (request, response) => {
            response.
                status(200).
                end();
        });
        that.private.server.post("/", (request, response) => {
            response.status(401).end();
        });
        that.private.initialized = true;
        that.private.initializing = false;
        callback(null);
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