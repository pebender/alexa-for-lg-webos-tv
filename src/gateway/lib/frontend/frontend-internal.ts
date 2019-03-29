import {FrontendSecurity} from "./frontend-security";
import {Mutex} from "async-mutex";
import {UninitializedClassError} from "../../../common";
import express from "express";
import expressCore from "express-serve-static-core";

export class FrontendInternal {
    private _initialized: boolean;
    private _initializeMutex: Mutex;
    private _security: FrontendSecurity;
    private _server: expressCore.Express;
    private _throwIfNotInitialized: (methodName: string) => void;
    public constructor(serverSecurity: FrontendSecurity) {
        this._initialized = false;
        this._initializeMutex = new Mutex();
        this._security = serverSecurity;
        this._server = express();

        this._throwIfNotInitialized = (methodName) => {
            if (this._initialized === false) {
                throw new UninitializedClassError("FrontendInternal", methodName);
            }
        };
    }

    public initialize(): Promise<void> {
        const that = this;

        function processForm(formAttributes: {hostname?: string; deletePassword?: string}): void {
            function processHostname(): void {
                let hostname = "";
                if (formAttributes !== null &&
                    Reflect.has(formAttributes, "hostname")
                ) {
                    hostname = (formAttributes.hostname as string);
                }
                that._security.setHostname(hostname);
            }

            function processPassword(): void {
                let deletePassword = false;
                if (formAttributes !== null &&
                    Reflect.has(formAttributes, "deletePassword") &&
                    (formAttributes.deletePassword as string).toUpperCase() === "ON"
                ) {
                    deletePassword = true;
                }
                if (deletePassword) {
                    that._security.setUserPassword(null);
                }
            }

            processHostname();
            processPassword();
        }

        async function createForm(): Promise<string> {
            const hostname = await that._security.getHostname();
            const passwordIsNull = await that._security.userPasswordIsNull();

            let deletePasswordHTML = "";
            if (passwordIsNull) {
                deletePasswordHTML = "" +
                    "<label>" +
                        "LG webOS TV gateway password delete" +
                        " (already deleted)" +
                        ":" +
                        "<input" +
                            " type=\"checkbox\"" +
                            " name=\"deletePassword\"" +
                            " checked" +
                            " disabled" +
                        " />" +
                    "</label>";
            } else {
                deletePasswordHTML = "" +
                    "<label>" +
                        "LG webOS TV gateway password delete" +
                        ":" +
                        "<input" +
                            " type=\"checkbox\"" +
                            " name=\"deletePassword\"" +
                        " />" +
                    "</label>";
            }

            const form = `<!DOCTYPE html>
                <html>
                    <head>
                        <title>
                            LG webOS TV gateway
                        </title>
                    </head>
                    <body>
                        <H1>LG webOS TV gateway</H1>
                            <form  method="post" action="/" enctype="application/x-www-form-urlencoded">
                                <div>
                                    <label>
                                        LG webOS TV gateway hostname:
                                        <input type="text" name="hostname" value="${hostname}" />
                                    </label>
                                </div>
                                <div>
                                    ${deletePasswordHTML}
                                </div>
                                <div class="button">
                                    <button type="submit">submit your changes</button>
                                </div>
                            </form>
                    </body>
                </html>`;
            return form;
        }

        function sendForm(form: string, response: expressCore.Response): void {
            response.
                type("html").
                status(200).
                send(form).
                end();
        }

        async function getHandler(request: expressCore.Request, response: expressCore.Response): Promise<void> {
            const form = await createForm();
            await sendForm(form, response);
        }

        async function postHandler(request: expressCore.Request, response: expressCore.Response): Promise<void> {
            await processForm(request.body);
            const form = await createForm();
            await sendForm(form, response);
        }

        return that._initializeMutex.runExclusive(() => new Promise<void>((resolve) => {
            if (that._initialized === true) {
                resolve();
                return;
            }

            this._server.use(express.urlencoded({
                "extended": false
            }));
            this._server.get("/", getHandler);
            this._server.post("/", postHandler);
            this._initialized = true;
            resolve();
        }));
    }

    public start(): void {
        this._throwIfNotInitialized("start");
        this._server.listen(25393);
    }
}