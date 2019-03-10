const express = require("express");
const {Mutex} = require("async-mutex");
const {UnititializedClassError} = require("../common");

const mutex = new Mutex();

class ServerInternal {
    constructor(serverSecurity) {
        this.private = {};
        this.private.initialized = false;
        this.private.security = serverSecurity;
        this.private.server = null;

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("ServerInternal", methodName);
            }
        };
    }

    initialize() {
        // eslint-disable-next-line func-style
        const processForm = (formAttributes) => {
            const processHostname = () => {
                let hostname = "";
                if (formAttributes !== null &&
                    Reflect.has(formAttributes, "hostname")
                ) {
                    ({hostname} = formAttributes);
                }
                this.private.security.setHostname(hostname);
            };

            const processPassword = () => {
                let deletePassword = false;
                if (formAttributes !== null &&
                    Reflect.has(formAttributes, "deletePassword") &&
                    formAttributes.deletePassword.toUpperCase() === "ON"
                ) {
                    deletePassword = true;
                }
                if (deletePassword) {
                    this.private.security.setUserPassword(null);
                }
            };

            processHostname();
            processPassword();
        };

        const createForm = async () => {
            const hostname = await this.private.security.getHostname();
            const passwordIsNull = await this.private.security.userPasswordIsNull();

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
        };

        function sendForm(form, response) {
            response.
                type("html").
                status(200).
                send(form).
                end();
        }

        async function getHandler(request, response) {
            const form = await createForm(request, response);
            await sendForm(form, response);
        }

        async function postHandler(request, response) {
            await processForm(request.body);
            const form = await createForm(request, response);
            await sendForm(form, response);
        }

        return mutex.runExclusive(() => new Promise((resolve) => {
            if (this.private.initialized === true) {
                resolve();
                return;
            }

            this.private.server = express();

            this.private.server.use(express.urlencoded({
                "extended": false
            }));
            this.private.server.get("/", getHandler);
            this.private.server.post("/", postHandler);
            this.private.initialized = true;
            resolve();
        }));
    }

    start() {
        this.private.throwIfNotInitialized("start");
        this.private.server.listen(25393);
    }
}

module.exports = ServerInternal;