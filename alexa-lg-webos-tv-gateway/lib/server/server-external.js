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
            that.private.server.use("/HTTP", basicAuth({"authorizer": requestAuthorizeHTTP}));
            that.private.server.post("/HTTP", httpHandler);
            that.private.server.use("/LGTV", basicAuth({"authorizer": requestAuthorizeLGTV}));
            that.private.server.post("/LGTV/RUN", lgtvRunHandler);
            that.private.server.post("/LGTV/SKILL", lgtvSkillHandler);
            that.private.server.get("/LGTV/PING", lgtvPingHandler);
            that.private.server.post("/", (request, response) => {
                response.status(401).end();
            });
            that.private.initialized = true;
            that.private.initializing = false;
            resolve();

            function requestAuthorizeHTTP(username, password) {
                if (username === "HTTP" && password === constants.password) {
                    return true;
                }
                return false;
            }

            function httpHandler(request, response) {
                if (Reflect.has(request.body, "command") && request.body.command.name === "passwordSet") {
                    let body = {};
                    if (that.private.security.password === null) {
                        that.private.security.password = request.body.command.value;
                        body = {};
                    } else {
                        body = {
                            "error": {
                                "message": "Gateway's password is already set."
                            }
                        };
                    }
                    response.
                        type("json").
                        status(200).
                        json(body).
                        end();
                } else {
                    response.
                        status(400).
                        end();
                }
            }

            function requestAuthorizeLGTV(username, password) {
            //    if (username === that.private.security.username && password === that.private.security.password) {
                if (username === that.private.security.username && password === "0") {
                    return true;
                }
                return false;
            }

            function lgtvRunHandler(request, response) {
                that.private.lgtv.runCommand(request.body).
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
            console.log(JSON.stringify(request.body, null, 2));
                that.private.lgtv.skillCommand(request.body).
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
            }

            function lgtvPingHandler(request, response) {
                response.
                    status(200).
                    end();
            }
        });
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