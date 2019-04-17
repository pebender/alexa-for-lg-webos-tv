/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */

import {CustomSkill} from "../custom-skill";
import {FrontendSecurity} from "./frontend-security";
import {Mutex} from "async-mutex";
import {SmartHomeSkill} from "../smart-home-skill";
import {UninitializedClassError} from "../../../common";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const basicAuth = require("express-basic-auth");
import express from "express";
import expressCore from "express-serve-static-core";

export class FrontendExternal {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _security: FrontendSecurity;
    private _customSkill: CustomSkill;
    private _smartHomeSkill: SmartHomeSkill;
    private _server: expressCore.Express;
    public constructor(serverSecurity: FrontendSecurity, customSkill: CustomSkill, smartHomeSkill: SmartHomeSkill) {
        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._security = serverSecurity;
        this._customSkill = customSkill;
        this._smartHomeSkill = smartHomeSkill;
        this._server = express();
    }

    private throwIfNotInitialized(methodName: string): void {
        if (this._initialized === false) {
            throw new UninitializedClassError("FrontendExternal", methodName);
        }
    }

    public initialize(): Promise<void> {
        const that = this;

        function authorizeRoot(username: string, password: string): boolean {
            return that._security.authorizeRoot(username, password);
        }

        function authorizeUser(username: string, password: string): Promise<boolean> {
            return that._security.authorizeUser(username, password);
        }

        async function httpHandler(request: expressCore.Request, response: expressCore.Response): Promise<void> {
            if (("command" in request.body) && request.body.command.name === "passwordSet") {
                let body: {[x: string]: boolean | number | string | object} = {
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

        async function backendSkillHandler(request: express.Request, response: express.Response): Promise<void> {
            if (typeof request.body.log !== "undefined") {
                console.log(JSON.stringify(request.body, null, 2));
                response.
                    type("json").
                    status(200).
                    json({}).
                    end();
                return;
            }
            // X    console.log(JSON.stringify(request.body, null, 2));
            const commandResponse = await that._smartHomeSkill.handler(request.body);
            // X    console.log(JSON.stringify(commandResponse, null, 2));
            response.
                type("json").
                status(200).
                json(commandResponse).
                end();
        }

        function backendPingHandler(_request: expressCore.Request, response: expressCore.Response): void {
            response.
                status(200).
                end();
        }

        async function backendRunHandler(request: express.Request, response: express.Response): Promise<void> {
            const commandResponse = await that._customSkill.handler(request.body);
            response.
                type("json").
                status(200).
                json(commandResponse).
                end();
        }

        return that._initializeMutex.runExclusive((): Promise<void> => new Promise<void>((resolve): void => {
            if (that._initialized === true) {
                resolve();
                return;
            }

            that._server.use("/", express.json());
            that._server.use("/HTTP", basicAuth({"authorizer": authorizeRoot}));
            that._server.post("/HTTP", httpHandler);
            that._server.use("/LGTV", basicAuth({"authorizer": authorizeUser}));
            that._server.post("/LGTV/RUN", backendRunHandler);
            that._server.post("/LGTV/SKILL", backendSkillHandler);
            that._server.get("/LGTV/PING", backendPingHandler);
            that._server.post("/", (_req: expressCore.Request, res: expressCore.Response): void => {
                res.status(401).end();
            });
            that._initialized = true;
            resolve();
        }));
    }

    public start(): void {
        this.throwIfNotInitialized("start");
        this._server.listen(25391, "localhost");
    }
}