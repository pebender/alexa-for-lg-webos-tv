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
const {UnititializedClassError} = require("alexa-lg-webos-tv-common");

class ServerExternal {
    constructor(serverSecurity, backend) {
        this.private = {};
        this.private.initialized = false;
        this.private.initializeMutex = new Mutex();
        this.private.security = serverSecurity;
        this.private.backend = backend;
        this.private.server = null;

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("ServerInternal", methodName);
            }
        };
    }

    initialize() {
        const that = this;

        return that.private.initializeMutex.runExclusive(() => new Promise((resolve) => {
            if (this.private.initialized === true) {
                resolve();
                return;
            }

            this.private.server = express();
            this.private.server.use("/", express.json());
            this.private.server.use("/HTTP", basicAuth({"authorizer": authorizeRoot}));
            this.private.server.post("/HTTP", httpHandler);
            this.private.server.use("/LGTV", basicAuth({"authorizer": authorizeUser}));
            this.private.server.post("/LGTV/RUN", backendRunHandler);
            this.private.server.post("/LGTV/SKILL", backendSkillHandler);
            this.private.server.get("/LGTV/PING", backendPingHandler);
            this.private.server.post("/", (request, response) => {
                response.status(401).end();
            });
            this.private.initialized = true;
            resolve();
        }));

        function authorizeRoot(username, password) {
            return that.private.security.authorizeRoot(username, password);
        }

        function authorizeUser(username, password) {
            return that.private.security.authorizeUser(username, password);
        }

        async function httpHandler(request, response) {
            if (Reflect.has(request.body, "command") && request.body.command.name === "passwordSet") {
                let body = {
                    "error": {
                        "message": "The password is already set."
                    }
                };
                try {
                    if (await that.private.security.userPasswordIsNull()) {
                        await that.private.security.setUserPassword(request.body.command.value);
                        body = {};
                    }
                } catch (error) {
                    body = {
                        "error": {
                            "name": error.name,
                            "message": error.message
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

        async function backendRunHandler(request, response) {
            const commandResponse = await that.private.backend.runCommand(request.body);
            response.
                type("json").
                status(200).
                json(commandResponse).
                end();
        }

        async function backendSkillHandler(request, response) {
            if (Reflect.has(request.body, "log")) {
console.log(JSON.stringify(request.body, null, 2));
                response.
                    type("json").
                    status(200).
                    json({}).
                    end();
                return;
            }
// console.log(JSON.stringify(request.body, null, 2));
            const commandResponse = await that.private.backend.skillCommand(request.body);
// console.log(JSON.stringify(commandResponse, null, 2));
            response.
                type("json").
                status(200).
                json(commandResponse).
                end();
        }

        function backendPingHandler(_request, response) {
            response.
                status(200).
                end();
        }
    }

    start() {
        this.private.throwIfNotInitialized("start");
        this.private.server.listen(25391, "localhost");
    }
}

module.exports = ServerExternal;