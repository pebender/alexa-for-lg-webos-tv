const express = require("express");
const {Mutex} = require("async-mutex");
const {UnititializedClassError} = require("../common");

const mutex = new Mutex();

class ServerInternal {
    constructor(serverSecurity) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.security = serverSecurity;
        that.private.server = null;
    }

    initialize() {
        const that = this;
        return mutex.runExclusive(initializeHandler);
        function initializeHandler() {
            return new Promise((resolve) => {
                if (that.private.initialized === true) {
                    resolve();
                    return;
                }

                that.private.server = express();

                that.private.server.use(express.urlencoded({
                    "extended": false
                }));
                that.private.server.get("/", getHandler);
                that.private.server.post("/", postHandler);
                that.private.initialized = true;
                resolve();
                // eslint-disable-next-line no-useless-return
                return;
            });

            function getHandler(request, response) {
                createForm(request, response).
                    then((form) => sendForm(form, response));
            }

            function postHandler(request, response) {
                processForm(request.body).
                    then(() => createForm(request, response)).
                    then((form) => sendForm(form, response));
            }

            function processForm(formAttributes) {
                return new Promise((resolve) => {
                    resolve(processHostname(formAttributes).then(() => processPassword()));
                });

                function processHostname() {
                    return new Promise((resolve) => {
                        let hostname = "";
                        if (formAttributes !== null &&
                            Reflect.has(formAttributes, "hostname")
                        ) {
                            ({hostname} = formAttributes);
                        }
                        resolve(that.private.security.setHostname(hostname));
                        // eslint-disable-next-line no-useless-return
                        return;
                    });
                }

                function processPassword() {
                    return new Promise((resolve) => {
                        let deletePassword = false;
                        if (formAttributes !== null &&
                            Reflect.has(formAttributes, "deletePassword") &&
                            formAttributes.deletePassword.toUpperCase() === "ON"
                        ) {
                            deletePassword = true;
                        }
                        if (deletePassword) {
                            resolve(that.private.security.setUserPassword(null));
                            return;
                        }
                        resolve();
                        // eslint-disable-next-line no-useless-return
                        return;
                    });
                }
            }

            function createForm() {
                return Promise.all([
                    that.private.security.getHostname(),
                    that.private.security.userPasswordIsNull()
                ]).
                then((values) => {
                    const [
                        hostname,
                        passwordIsNull
                    ] = values;

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
                });
            }

            function sendForm(form, response) {
                return new Promise((resolve) => {
                    response.
                        type("html").
                        status(200).
                        send(form).
                        end();
                    resolve();
                });
            }
        }
    }

    start() {
        const that = this;
        if (that.private.initialized === false) {
            throw new UnititializedClassError("ServerInternal", "start");
        }

        return that.private.server.listen(25393);
    }
}

module.exports = ServerInternal;