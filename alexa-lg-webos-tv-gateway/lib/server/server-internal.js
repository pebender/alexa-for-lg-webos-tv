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

            that.private.server.use("/HTTP/form", express.urlencoded({
                "extended": false
            }));
            that.private.server.get("/HTTP/form", (request, response) => {
                that.private.security.hostname = request.query.hostname;
                if (("passwordDelete" in request.query) && (/^on$/i).test(request.query.passwordDelete)) {
                    that.private.security.password = null;
                }
                const {hostname, password} = that.private.security;
                let hostnameHTML = "<p>The LG webOS TV gateway has no hostname.</p>";
                if (hostname !== null) {
                    hostnameHTML = `<p>The LG webOS TV gateway hostname is ${hostname}.`;
                }
                let passwordHTML = "<p>The LG webOS TV gateway has no password.</p>";
                if (password !== null) {
                    passwordHTML = "<p>The LG webOS TV gateway has a password.</p>";
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
                            ${hostnameHTML}
                            ${passwordHTML}
                        </body>
                    </html>`;
                response.
                    type("html").
                    status(200).
                    send(page).
                    end();
            });
            that.private.server.get("/", (request, response) => {
                let hostname = "";
                if (that.private.security.hostname !== null) {
                    ({hostname} = that.private.security);
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
                                <form action="/HTTP/form" enctype="url-encoded" method="get">
                                    <div>
                                        <label for="hostname_label">LG webOS TV gateway hostname:</label>
                                        <input type="text" id="hostname_id" name="hostname" value="${hostname}">
                                    </div>
                                    <div>
                                        <label for="hostname_label">LG webOS TV gateway password delete:</label>
                                        <input type="checkbox" id="passwordDelete_id" name="passwordDelete">
                                    </div>
                                    <div class="button">
                                        <button type="submit">submit your changes</submit>
                                    </div>
                                </form>
                        </body>
                    </html>`;
                response.
                    type("html").
                    status(200).
                    send(page).
                    end();
            });
            that.private.initialized = true;
            that.private.initializing = false;
            resolve();
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