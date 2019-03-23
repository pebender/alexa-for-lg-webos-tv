/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */

import express from "express";
const basicAuth = require("express-basic-auth");
import {Mutex} from "async-mutex";
const {unititializedClassError} = require("alexa-lg-webos-tv-common");
import {FrontendSecurity} from "./frontend-security";
import {Backend} from "../backend";
import exporessCore from "express-serve-static-core";
export class FrontendExternal {
    _initialized: boolean;
    _initializeMutex: Mutex;
    _security: FrontendSecurity;
    _backend: Backend;
    _server: exporessCore.Express;
    _throwIfNotInitialized: (methodName: string) => void;
    constructor(serverSecurity: FrontendSecurity, backend: Backend) {
        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._security = serverSecurity;
        this._backend = backend;
        this._server = express();

        this._throwIfNotInitialized = (methodName) => {
            if (this._initialized === false) {
                throw new unititializedClassError("FrontendInternal", methodName);
            }
        };
    }

    initialize() {
        const that = this;

        return that._initializeMutex.runExclusive(() => new Promise((resolve) => {
            if (this._initialized === true) {
                resolve();
                return;
            }

            this._server.use("/", express.json());
            this._server.use("/HTTP", basicAuth({"authorizer": authorizeRoot}));
            this._server.post("/HTTP", httpHandler);
            this._server.use("/LGTV", basicAuth({"authorizer": authorizeUser}));
            this._server.post("/LGTV/RUN", backendRunHandler);
            this._server.post("/LGTV/SKILL", backendSkillHandler);
            this._server.get("/LGTV/PING", backendPingHandler);
            this._server.post("/", (_request: exporessCore.Request, response: exporessCore.Response) => {
                response.status(401).end();
            });
            this._initialized = true;
            resolve();
        }));

        function authorizeRoot(username: string, password: string): boolean {
            return that._security.authorizeRoot(username, password);
        }

        function authorizeUser(username: string, password: string): Promise<boolean> {
            return that._security.authorizeUser(username, password);
        }

        async function httpHandler(request: exporessCore.Request, response: exporessCore.Response): Promise<void> {
            if (("command" in request.body) && request.body.command.name === "passwordSet") {
                let body: {[x: string]: any} | {} = {
                    "error": {
                        "message": "The password is already set."
                    }
                };
                try {
                    if (await that._security.userPasswordIsNull()) {
                        await that._security.setUserPassword(request.body.command.value);
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

        async function backendRunHandler(request: express.Request, response: express.Response): Promise<void> {
            const commandResponse = await that._backend.runCommand(request.body);
            response.
                type("json").
                status(200).
                json(commandResponse).
                end();
        }

        async function backendSkillHandler(request: express.Request, response: express.Response): Promise<void> {
            if (Reflect.has(request.body, "log")) {
console.log(JSON.stringify(request.body, null, 2));
                response.
                    type("json").
                    status(200).
                    json({}).
                    end();
                return;
            }
console.log(JSON.stringify(request.body, null, 2));
            const commandResponse = await that._backend.skillCommand(request.body);
console.log(JSON.stringify(commandResponse, null, 2));
            response.
                type("json").
                status(200).
                json(commandResponse).
                end();
        }

        function backendPingHandler(_request: exporessCore.Request, response: exporessCore.Response): void {
            response.
                status(200).
                end();
        }
    }

    start() {
        this._throwIfNotInitialized("start");
        this._server.listen(25391, "localhost");
    }
}