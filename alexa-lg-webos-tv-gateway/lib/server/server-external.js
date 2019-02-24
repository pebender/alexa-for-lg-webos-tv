const express = require("express");
const basicAuth = require("express-basic-auth");

class ServerExternal {
    constructor(security, lgtv) {
        const that = this;
        that.private = {};
        that.private.lgtv = lgtv;
        that.private.security = security;
        that.private.server = express();
        that.private.server.use("/", express.json());
        that.private.server.use("/HTTP", basicAuth({"authorizer": authorizeRoot}));

        async function authorizeRoot(username, password) {
            const authrizationFlag = await that.private.security.rootAuthorize(username, password);
            return authrizationFlag;
        }

        that.private.server.post("/HTTP", async (request, response) => {
            if (Reflect.has(request.body, "command") && request.body.command.name === "passwordSet") {
                const pass = await that.private.security.gePassword();
                if (pass === null) {
                    await that.private.security.setPassword(request.body.command.value);
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
        that.private.server.use("/LGTV", basicAuth({"authorizer": authorizeUser}));
        async function authorizeUser(username, password) {
            const authrizationFlag = await that.private.security.authorize(username, password);
            return authrizationFlag;
        }
        that.private.server.post("/LGTV/RUN", (request, response) => {
            that.private.lgtv.controller.smartHomeSkillCommand(request.body).
            then((res) => {
                response.
                    type("json").
                    status(200).
                    json(res).
                    end();
            });
        });
        that.private.server.post("/LGTV/SKILL", (request, response) => {
console.log(JSON.stringify(request.body, null, 2));
            that.private.lgtv.controller.smartHomeSkillCommand(request.body).
            then((res) => {
console.log(JSON.stringify(res, null, 2));
                response.
                    type("json").
                    status(200).
                    json(res).
                    end();
                });
        });
        that.private.server.get("/LGTV/PING", (request, response) => {
            response.
                status(200).
                end();
        });
        that.private.server.post("/", (request, response) => {
            response.
                status(401).
                end();
        });
    }

    // eslint-disable-next-line class-methods-use-this
    initialize() {
        //
    }

    start() {
        this.private.server.listen(25391, "localhost");
    }
}

module.exports = ServerExternal;