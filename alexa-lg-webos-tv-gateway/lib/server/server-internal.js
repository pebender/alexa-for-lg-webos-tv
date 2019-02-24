const express = require("express");

class ServerInternal {
    constructor(security) {
        const that = this;
        that.private = {};
        that.private.security = security;
        that.private.server = express();
        that.private.server.use("/", express.urlencoded({
            "extended": false
        }));
        that.private.server.post("/", processPost);
        that.private.server.get("/", processGet);

        function processPost(request, response) {
            processForm(request.body).
            then(renderForm).
            then((page) => {
                response.
                    type("html").
                    status(200).
                    send(page).
                    end();
            });
        }

        function processGet(request, response) {
            renderForm().
            then((page) => {
                response.
                    type("html").
                    status(200).
                    send(page).
                    end();
            });
        }

        function processForm(query) {
            return new Promise((resolve) => {
                const setList = [];
                if (Reflect.has(query, "hostname")) {
                    const setPromise = that.private.security.setHostname(query.hostname);
                    setList.push(setPromise);
                }
                if (Reflect.has(query, "deletPassword") && (query.deletPassword.toUpperCase() === "ON")) {
                    const setPromise = that.private.security.setPassword(null);
                    setList.push(setPromise);
                }
                resolve(Promise.all(setList).then());
            });
        }

        function renderForm() {
            return Promise.all([
                that.private.security.getHostname(),
                that.private.security.getPassword()
            ]).
            then((values) => {
                const [
                    hostname,
                    password
                ] = values;
                let passwordDeleteHTMLInput = "";
                let passwordDeleteHTMLLabel = "";
                if (password === null) {
                    passwordDeleteHTMLLabel = "<label" +
                            "for=\"passwordDeleteId\"" +
                        ">" +
                            "LG webOS TV gateway password delete (already deleted):" +
                        "</label>";
                    passwordDeleteHTMLInput = "<input" +
                            " type=\"checkbox\"" +
                            " id=\"passwordDeleteId\"" +
                            " name=\"passwordDelete\"" +
                            " checked" +
                            " disabled" +
                        ">";
                } else {
                    passwordDeleteHTMLLabel = "<label" +
                            " for=\"passwordDeleteId\"" +
                        ">" +
                            "LG webOS TV gateway password delete:" +
                        "</label>";
                    passwordDeleteHTMLInput = "<input" +
                            " type=\"checkbox\"" +
                            " id=\"passwordDeleteId\"" +
                            " name=\"passwordDelete\"" +
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
                                        <label for="hostnameId">LG webOS TV gateway hostname:</label>
                                        <input type="text" id="hostnameId" name="hostname" value="${hostname}">
                                    </div>
                                    <div>
                                        ${passwordDeleteHTMLLabel}
                                        ${passwordDeleteHTMLInput}
                                    </div>
                                    <div class="button">
                                        <button type="submit">submit your changes</submit>
                                    </div>
                                </form>
                        </body>
                    </html>`;
                return page;
            });
        }
    }

    // eslint-disable-next-line class-methods-use-this
    initialize() {
        //
    }

    start() {
        this.private.server.listen(25393);
    }
}

module.exports = ServerInternal;