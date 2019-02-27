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

            that.private.server.use("/", express.urlencoded({
                "extended": false
            }));
            that.private.server.post("/", postHandler);
            that.private.server.get("/", getHandler);
            that.private.initialized = true;
            that.private.initializing = false;
            resolve();

            function postHandler(request, response) {
                that.private.security.hostname = request.query.hostname;
                if (("deletePassword" in request.query) && (/^on$/i).test(request.query.deletePassword)) {
                    that.private.security.password = null;
                }
                getHandler(request, response);
            }

            function getHandler(_request, response) {
                let hostname = "";
                if (that.private.security.hostname !== null) {
                    ({hostname} = that.private.security);
                }
                let deletePasswordHTMLLabel = "";
                let deletePasswordHTMLInput = "";
                if (that.private.security.password === null) {
                    deletePasswordHTMLLabel = "<label" +
                            " for=\"deletePassword\"" +
                        ">" +
                            "LG webOS TV gateway password delete" +
                            " (already deleted)" +
                            ":" +
                        "</label>";
                    deletePasswordHTMLInput = "<input" +
                            " type=\"checkbox\"" +
                            " id=\"deletePassword\"" +
                            " name=\"deletePassword\"" +
                            " checked" +
                            " disabled" +
                        ">";
                } else {
                    deletePasswordHTMLLabel = "<label" +
                            " for=\"deletePassword\"" +
                        ">" +
                            "LG webOS TV gateway password delete" +
                            ":" +
                        "</label>";
                    deletePasswordHTMLInput = "<input" +
                            " type=\"checkbox\"" +
                            " id=\"deletePassword\"" +
                            " name=\"deletePassword\"" +
                        ">";
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
                                <form action="/" enctype="url-encoded" method="post">
                                    <div>
                                        <label for="hostname">LG webOS TV gateway hostname:</label>
                                        <input type="text" id="hostname" name="hostname" value="${hostname}">
                                    </div>
                                    <div>
                                        ${deletePasswordHTMLLabel}
                                        ${deletePasswordHTMLInput}
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