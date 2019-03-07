const https = require("https");
const {constants} = require("alexa-lg-webos-tv-common");
const httpStatusMessages = require("./http-status-messages.js");

class Gateway {
    constructor(userId) {
        this.private = {
            "userId": userId,
            "hostname": null,
            "username": null,
            "password": null
        };

        // These will be in a database indexed by userId.
        this.private.hostname = constants.gatewayHostname;
        this.private.username = "LGTV";
        this.private.password = constants.gatewayUserPassword;
    }

    set hostname(hostname) {
        this.private.null = hostname;
    }

    get hostname() {
        return this.private.hostname;
    }

    set password(password) {
        this.private.null = password;
    }

    get password() {
        return this.private.password;
    }

    get username() {
        return this.private.username;
    }

    // eslint-disable-next-line class-methods-use-this
    sendSkillDirective(request) {
        return new Promise((resolve, reject) => {
            const options = {
                "hostname": this.hostname,
                "username": this.username,
                "password": this.password,
                "path": "/LGTV/SKILL"
            };
            sendHandler(options, request).then((response) => resolve(response), (error) => reject(error));
        });
    }

    ping() {
        return new Promise((resolve, reject) => {
            const options = {
                "hostname": this.hostname,
                "username": this.username,
                "password": this.password,
                "path": "/LGTV/PING"
            };
            pingHandler(options).then((response) => resolve(response), (error) => reject(error));
        });
    }
}

function pingHandler(requestOptions) {
    return new Promise((resolve, reject) => {

        if (Reflect.has(requestOptions, "hostname") === false || requestOptions.hostname === null) {
            const error = new Error();
            error.name = "HOSTNAME_NOT_SET";
            error.message = "The gateway hostname has not been set.";
            reject(error);
        }

        if (Reflect.has(requestOptions, "username") === false || requestOptions.username === null) {
            const error = new Error();
            error.name = "USERNAME_NOT_SET";
            error.message = "The gateway username has not been set.";
            reject(error);
        }

        if (Reflect.has(requestOptions, "password") === false || requestOptions.password === null) {
            const error = new Error();
            error.name = "PASSWORD_NOT_SET";
            error.message = "The gateway password has not been set.";
            reject(error);
        }

        if (Reflect.has(requestOptions, "path") === false || requestOptions.path === null) {
            const error = new Error();
            error.name = "PATH_NOT_SET";
            error.message = "The gateway path has not been set.";
            reject(error);
        }

        const authorization = Buffer.from(`${requestOptions.username}:${requestOptions.password}`).toString("base64");
        const options = {
            "hostname": requestOptions.hostname,
            "port": 25392,
            "path": requestOptions.path,
            "headers": {
                "Authorization": `Basic ${authorization}`
            }
        };
        const request = https.get(options);
        request.once("response", (response) => {
            response.setEncoding("utf8");
            response.on("data", (chunk) => {
                // eslint-disable-next-line no-unused-vars
                const nothing = chunk;
            });
            response.on("end", () => {
                if (response.statusCode === 200) {
                    resolve(true);
                }
                if (Reflect.has(httpStatusMessages, response.statusCode)) {
                    const error = new Error();
                    error.name = "HTTP_SERVER_ERROR";
                    error.message = "The gateway returned HTTP/1.1 status " +
                        ` '${httpStatusMessages[response.statusCode]} (${response.statusCode})'.`;
                    reject(error);
                }
                const error = new Error();
                error.name = "HTTP_SERVER_ERROR";
                error.message = "The gateway returned HTTP/1.1 status " +
                    ` '${response.statusCode}'.`;
                reject(error);
            });
            response.on("error", (error) => reject(error));
        });
        request.on("error", (error) => reject(error));
    });
}

function sendHandler(requestOptions, requestBody) {
    return new Promise((resolve, reject) => {

        if (Reflect.has(requestOptions, "hostname") === false || requestOptions.hostname === null) {
            const error = new Error();
            error.name = "HOSTNAME_NOT_SET";
            error.message = "The gateway hostname has not been set.";
            reject(error);
        }

        if (Reflect.has(requestOptions, "username") === false || requestOptions.username === null) {
            const error = new Error();
            error.name = "USERNAME_NOT_SET";
            error.message = "The gateway username has not been set.";
            reject(error);
        }

        if (Reflect.has(requestOptions, "password") === false || requestOptions.password === null) {
            const error = new Error();
            error.name = "PASSWORD_NOT_SET";
            error.message = "The gateway password has not been set.";
            reject(error);
        }

        if (Reflect.has(requestOptions, "path") === false || requestOptions.path === null) {
            const error = new Error();
            error.name = "PATH_NOT_SET";
            error.message = "The gateway path has not been set.";
            reject(error);
        }

        const authorization = Buffer.from(`${requestOptions.username}:${requestOptions.password}`).toString("base64");
        const content = JSON.stringify(requestBody);
        const options = {
            "hostname": requestOptions.hostname,
            "port": 25392,
            "path": requestOptions.path,
            "method": "POST",
            "headers": {
                "Authorization": `Basic ${authorization}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(content)
            },
            "rejectUnauthorized":
                Reflect.has(requestOptions, "rejectUnauthorized")
                    ? requestOptions.rejectUnauthorized
                    : true
        };
        const request = https.request(options);
        request.once("response", (response) => {
            let body = {};
            let data = "";
            response.setEncoding("utf8");
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                if (response.statusCode !== 200) {
                    if (!Reflect.has(httpStatusMessages, response.statusCode)) {
                        const message = "The gateway returned HTTP/1.1 status code" +
                            ` '${response.statusCode}'.`;
                        return reject(new GatewayAPIError(message));
                    }
                    const message = "The gateway returned HTTP/1.1 status message" +
                        ` '${httpStatusMessages[response.statusCode]} (${response.statusCode})'.`;
                    return reject(new GatewayAPIError(message));
                }
                if (!(/^application\/json/).test(response.headers["content-type"])) {
                    const message = "The gateway returned the wrong content type.";
                    return reject(new GatewayAPIError(message));
                }
                try {
                    body = JSON.parse(data);
                } catch (error) {
                    const message = "The gateway returned corrupted content.";
                    return reject(new GatewayAPIError(message));
                }
                if (Reflect.has(body, "error")) {
                    let message = "The gateway returned the error";
                    if (Reflect.has(body.error, "name")) {
                        message += ` [${body.error.name}: ${body.error.message}]`;
                    } else {
                        message += ` ${body.error.message}`;
                    }
                    return reject(new GatewayAPIError(message));
                }
                return resolve(body);
            });
            response.on("error", (error) => {
                const message = "There was a problem talking to the gateway." +
                    ` The error was [${error.name}: ${error.message}].`;
                return reject(new GatewayAPIError(message));
            });
        });
        request.on("error", (error) => {
            const message = "There was a problem talking to the gateway." +
                ` The error was [${error.name}: ${error.message}].`;
            return reject(new GatewayAPIError(message));
        });
        request.write(content);
        request.end();
    });
}

/*
class GatewayAPIError extends Error {
    constructor(message, ...args) {
        super(message, ...args);
        this.name = "GatewayAPI_Error";
        this.message = message;
    }
}
*/

class GatewayAPIError extends Error {
    // eslint-disable-next-line no-useless-constructor
    constructor(message, ...args) {
        super(message, ...args);
    }
}

module.exports = Gateway;