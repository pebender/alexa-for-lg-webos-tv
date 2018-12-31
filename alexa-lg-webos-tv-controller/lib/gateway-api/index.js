const https = require("https");
const httpStatusMessages = require("./http-status-messages.js");

function send(postOptions, postBody) {
    return new Promise((resolve, reject) => {
        const authorization = Buffer.from(`${postOptions.username}:${postOptions.password}`).toString("base64");
        const content = JSON.stringify(postBody);
        const options = {
            "hostname": postOptions.hostname,
            "port": 25392,
            "path": postOptions.path,
            "method": "POST",
            "headers": {
                "Authorization": `Basic ${authorization}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(content)
            },
            "rejectUnauthorized":
                Reflect.has(postOptions, "rejectUnauthorized")
                    ? postOptions.rejectUnauthorized
                    : true
        };
        const request = https.request(options);
        request.write(content);
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
    });
}

class GatewayAPIError extends Error {
    constructor(message, ...args) {
        super(message, ...args);
        this.name = "GatewayAPI_Error";
        this.message = message;
    }
}

module.exports = {
    "send": send
};