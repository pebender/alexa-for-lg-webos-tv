const express = require("express");
const {UnititializedClassError} = require("../common");

class ServerInternal {
    constructor(serverSecurity) {
        const that = this;

        that.private = {};
        that.private.initialized = false;
        that.private.initializing = false;
        that.private.security = serverSecurity;
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

            that.private.server.use(express.urlencoded({
                "extended": false
            }));
            that.private.server.get("/", getHandler);
            that.private.server.post("/", postHandler);
            that.private.initialized = true;
            that.private.initializing = false;
            resolve();

            function getHandler(request, response) {
                sendForm(request, response);
            }

            function postHandler(request, response) {
                processForm(request.body);
                sendForm(request, response);
            }

            function processForm(formAttributes) {
                if (Reflect.has(formAttributes, "hostname")) {
                    that.private.security.hostname = formAttributes.hostname;
                }
                if (Reflect.has(formAttributes, "deletePassword") && formAttributes.deletePassword.toUpperCase() === "ON") {
                    that.private.security.password = null;
                }
            }

            function sendForm(request, response) {
                let hostname = "";
                if (that.private.security.hostname !== null) {
                    ({hostname} = that.private.security);
                }
                let deletePasswordHTML = "";
                if (that.private.security.password === null) {
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
                const page = `<!DOCTYPE html>
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
                response.
                    type("html").
                    status(200).
                    send(page).
                    end();
            }
        });
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