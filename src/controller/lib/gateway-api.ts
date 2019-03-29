import {AlexaRequest,
    AlexaResponse,
    GenericError,
    constants} from "../../common";
import http from "http";
import https from "https";

function createBasicOptions(requestOptions: {
    hostname: string;
    username: string;
    password: string;
    path: string;
    rejectUnauthorized?: boolean;
}): {
        hostname: string;
        port: number;
        path: string;
        headers: {[x: string]: string};
        rejectUnauthorized: boolean;
        // eslint-disable-next-line @typescript-eslint/indent
} {
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

function pingHandler(requestOptions: {
    hostname: string;
    username: string;
    password: string;
    path: string;
    rejectUnauthorized?: boolean;
}): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let options: {
            hostname: string;
            port: number;
            path: string;
            headers: {
                [x: string]: string;
            };
            rejectUnauthorized?: boolean;
        } = null;
        try {
            options = createBasicOptions(requestOptions);
        } catch (error) {
            reject(error);
        }
        const request = https.get(options);
        request.once("response", (response) => {
            response.setEncoding("utf8");
            response.on("data", (chunk: string) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _nothing: string = chunk;
            });
            response.on("end", () => {
                if (response.statusCode === 200) {
                    resolve(true);
                }
                if (Reflect.has(http.STATUS_CODES, response.statusCode)) {
                    const error = new Error();
                    error.name = "HTTP_SERVER_ERROR";
                    error.message = "The gateway returned HTTP/1.1 status " +
                        ` '${http.STATUS_CODES[response.statusCode]} (${response.statusCode})'.`;
                    reject(error);
                }
                const error = new Error();
                error.name = "HTTP_SERVER_ERROR";
                error.message = "The gateway returned HTTP/1.1 status " +
                    ` '${response.statusCode}'.`;
                reject(error);
            });
            response.on("error", (error: Error) => reject(error));
        });
        request.on("error", (error: Error) => reject(error));
    });
}

function sendHandler(requestOptions: {
    hostname: string;
    username: string;
    password: string;
    path: string;
    rejectUnauthorized?: boolean;
}, requestBody: any): Promise<any> {
    return new Promise((resolve, reject) => {
        let options: {
            method?: "POST";
            hostname: string;
            port: number;
            path: string;
            headers: {
                [x: string]: string;
            };
            rejectUnauthorized?: boolean;
        } = null;
        try {
            options = createBasicOptions(requestOptions);
        } catch (error) {
            reject(error);
        }
        const content = JSON.stringify(requestBody);
        options.method = "POST";
        options.headers["Content-Type"] = "application/json";
        options.headers["Content-Length"] = Buffer.byteLength(content).toString();
        const request = https.request(options);
        request.once("response", (response) => {
            let body: {[x: string]: any} = {};
            let data = "";
            response.setEncoding("utf8");
            response.on("data", (chunk: string) => {
                data += chunk;
            });
            response.on("end", () => {
                if (response.statusCode !== 200) {
                    if (!Reflect.has(http.STATUS_CODES, response.statusCode)) {
                        const message = "The gateway returned HTTP/1.1 status code" +
                            ` '${response.statusCode}'.`;
                        return reject(new GenericError("GatewayAPIError", message));
                    }
                    const message = "The gateway returned HTTP/1.1 status message" +
                        ` '${http.STATUS_CODES[response.statusCode]} (${response.statusCode})'.`;
                    return reject(new GenericError("GatewayAPIError", message));
                }
                if (!(/^application\/json/).test(response.headers["content-type"])) {
                    const message = "The gateway returned the wrong content type.";
                    return reject(new GenericError("GatewayAPIError", message));
                }
                try {
                    body = JSON.parse(data);
                } catch (error) {
                    const message = "The gateway returned corrupted content.";
                    return reject(new GenericError("GatewayAPIError", message));
                }
                if (Reflect.has(body, "error")) {
                    let message = "The gateway returned the error";
                    if (Reflect.has(body.error, "name")) {
                        message += ` [${body.error.name}: ${body.error.message}]`;
                    } else {
                        message += ` ${body.error.message}`;
                    }
                    return reject(new GenericError("GatewayAPIError", message));
                }
                return resolve(body);
            });
            response.on("error", (error: Error) => {
                const message = "There was a problem talking to the gateway." +
                    ` The error was [${error.name}: ${error.message}].`;
                return reject(new GenericError("GatewayAPIError", message));
            });
        });
        request.on("error", (error: Error) => {
            const message = "There was a problem talking to the gateway." +
                ` The error was [${error.name}: ${error.message}].`;
            return reject(new GenericError("GatewayAPIError", message));
        });
        request.write(content);
        request.end();
    });
}

class Gateway {
    private _userId: string;
    private _hostname: string;
    private _username: string;
    private _password: string;
    private _null: string;
    public constructor(userId: string) {

        this._userId = userId;
        this._hostname = null;
        this._username = null;
        this._password = null;


        // These will be in a database indexed by userId.
        this._hostname = constants.gatewayHostname;
        this._username = "LGTV";
        this._password = constants.gatewayUserPassword;
    }

    public set hostname(hostname: string) {
        this._null = hostname;
    }

    public get hostname(): string {
        return this._hostname;
    }

    public set password(password: string) {
        this._null = password;
    }

    public get password(): string {
        return this._password;
    }

    public get username(): string {
        return this._username;
    }

    public sendSkillDirective(request: AlexaRequest | {log: AlexaRequest} | {log: AlexaResponse}): Promise<AlexaResponse> {
        const options = {
            "hostname": this.hostname,
            "username": this.username,
            "password": this.password,
            "path": "/LGTV/SKILL"
        };
        return sendHandler(options, request);
    }

    public send(
        sendOptions: {
            hostname?: string;
            username?: string;
            password?: string;
            path: string;
        },
        request: any
    ): any {
        const options = {
            "hostname": Reflect.has(sendOptions, "hostname")
                ? sendOptions.hostname
                : this.hostname,
            "username": Reflect.has(sendOptions, "username")
                ? sendOptions.username
                : this.hostname,
            "password": Reflect.has(sendOptions, "password")
                ? sendOptions.password
                : this.password,
            "path": sendOptions.path
        };
        return sendHandler(options, request);
    }

    public ping(): Promise<boolean> {
        const options = {
            "hostname": this.hostname,
            "username": this.username,
            "password": this.password,
            "path": "/LGTV/PING"
        };
        return pingHandler(options);
    }
}

export {Gateway};