const https = require("https");
const {constants} = require("alexa-lg-webos-tv-common");

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
        const options = {
            "hostname": this.hostname,
            "username": this.username,
            "password": this.password,
            "path": "/LGTV/SKILL"
        };
        return sendHandler(options, request);
    }

    ping() {
        const options = {
            "hostname": this.hostname,
            "username": this.username,
            "password": this.password,
            "path": "/LGTV/PING"
        };
        return pingHandler(options);
    }
}

function pingHandler(requestOptions) {
    return new Promise((resolve, reject) => {
        let options = null;
        try {
            options = createBasicOptions(requestOptions);
        } catch (error) {
            reject(error);
        }
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
                if (Reflect.has(https.STATUS_CODES, response.statusCode)) {
                    const error = new Error();
                    error.name = "HTTP_SERVER_ERROR";
                    error.message = "The gateway returned HTTP/1.1 status " +
                        ` '${https.STATUS_CODES[response.statusCode]} (${response.statusCode})'.`;
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
        let options = null;
        try {
            options = createBasicOptions(requestOptions);
        } catch (error) {
            reject(error);
        }
        const content = JSON.stringify(requestBody);
        options.method = "POST";
        options.headers["Content-Type"] = "application/json";
        options.headers["Content-Length"] = Buffer.byteLength(content);
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
                    if (!Reflect.has(https.STATUS_CODES, response.statusCode)) {
                        const message = "The gateway returned HTTP/1.1 status code" +
                            ` '${response.statusCode}'.`;
                        return reject(new GatewayAPIError(message));
                    }
                    const message = "The gateway returned HTTP/1.1 status message" +
                        ` '${https.STATUS_CODES[response.statusCode]} (${response.statusCode})'.`;
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

function createBasicOptions(requestOptions) {
    if (Reflect.has(requestOptions, "hostname") === false || requestOptions.hostname === null) {
        throw new GenericError("HOSTNAME_NOT_SET", "The gateway hostname has not been set.");
    }
    if (Reflect.has(requestOptions, "username") === false || requestOptions.username === null) {
        throw new GenericError("USERNAME_NOT_SET", "The gateway username has not been set.");
    }
    if (Reflect.has(requestOptions, "password") === false || requestOptions.password === null) {
        throw new GenericError("PASSWORD_NOT_SET", "The gateway password has not been set.");
    }
    if (Reflect.has(requestOptions, "path") === false || requestOptions.path === null) {
        throw new GenericError("PATH_NOT_SET", "The gateway path has not been set.");
    }

    const authorization = Buffer.from(`${requestOptions.username}:${requestOptions.password}`).toString("base64");
    const options = {
        "hostname": requestOptions.hostname,
        "port": 25392,
        "path": requestOptions.path,
        "headers": {
            "Authorization": `Basic ${authorization}`
        },
        "rejectUnauthorized":
            Reflect.has(requestOptions, "rejectUnauthorized")
                ? requestOptions.rejectUnauthorized
                : true
    };
    return options;
}


class GenericError extends Error {
    constructor(name, message, ...args) {
        super(message, ...args);
        this.name = name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class GatewayAPIError extends GenericError {
    constructor(message, ...args) {
        super("GatewayAPIError", message, ...args);
    }
}

module.exports = Gateway;