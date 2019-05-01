import {BaseClass} from "../base-class";
import {FrontendSecurity} from "./frontend-security";
import express from "express";
import expressCore from "express-serve-static-core";

export class FrontendInternal extends BaseClass {
    private readonly _security: FrontendSecurity;
    private readonly _server: expressCore.Express;
    public constructor(serverSecurity: FrontendSecurity) {
        super();

        this._security = serverSecurity;
        this._server = express();
    }

    public initialize(): Promise<void> {
        const that = this;

        function processForm(formAttributes: {hostname?: string; deletePassword?: string}): void {
            function processHostname(): void {
                let hostname = "";
                if (typeof formAttributes !== "undefined" && typeof formAttributes.hostname === "string") {
                    ({hostname} = formAttributes);
                }
                that._security.setHostname(hostname);
            }

            function processPassword(): void {
                let deletePassword = false;
                if (formAttributes !== null &&
                    typeof formAttributes.deletePassword === "string" &&
                    formAttributes.deletePassword.toUpperCase() === "ON"
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

        function initializeFunction(): Promise<void> {
            return new Promise<void>(async (resolve): Promise<void> => {
                that._server.use(express.urlencoded({
                    "extended": false
                }));
                that._server.get("/", getHandler);
                that._server.post("/", postHandler);
                resolve();
            });
        }
        return this.initializeHandler(initializeFunction);
    }

    public start(): void {
        this.throwIfUninitialized("start");
        this._server.listen(25393);
    }
}