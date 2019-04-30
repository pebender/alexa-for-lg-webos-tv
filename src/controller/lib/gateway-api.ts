import * as ASH from "../../common/alexa";
import {constants} from "../../common/constants";
import http from "http";
import https from "https";

export interface GatewayRequest {
    [x: string]: number | string | object | undefined;
}

export interface GatewayResponse {
    error?: {
        name?: string;
        message?: string;
    };
    [x: string]: number | string | object | undefined;
}

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
        headers: {
            [x: string]: string;
        };
        rejectUnauthorized: boolean;
        // eslint-disable-next-line @typescript-eslint/indent
} {
    if (typeof requestOptions.hostname === "undefined" || requestOptions.hostname === null) {
        throw new RangeError("Gateway hostname not set.");
    }
    if (typeof requestOptions.username === "undefined" || requestOptions.username === null) {
        throw new RangeError("Gateway username not set.");
    }
    if (typeof requestOptions.password === "undefined" || requestOptions.password === null) {
        throw new RangeError("Gateway password not set.");
    }
    if (typeof requestOptions.path === "undefined" || requestOptions.path === null) {
        throw new RangeError("Gateway path not set.");
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
            typeof requestOptions.rejectUnauthorized !== "undefined"
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
    return new Promise((resolve, reject): void => {
        let options: {
            hostname: string;
            port: number;
            path: string;
            headers: {
                [x: string]: string;
            };
            rejectUnauthorized: boolean;
        } | null = null;
        try {
            options = createBasicOptions(requestOptions);
        } catch (error) {
            reject(error);
            return;
        }
        const request = https.get(options);
        request.once("response", (response): void => {
            response.setEncoding("utf8");
            response.on("data", (chunk: string): void => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _nothing: string = chunk;
            });
            response.on("end", (): void => {
                if (response.statusCode === 200) {
                    resolve(true);
                }
                if (typeof http.STATUS_CODES[response.statusCode] !== "undefined") {
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
            response.on("error", (error: Error): void => reject(error));
        });
        request.on("error", (error: Error): void => reject(error));
    });
}

function sendHandler(requestOptions: {
    hostname: string;
    username: string;
    password: string;
    path: string;
    rejectUnauthorized?: boolean;
}, requestBody: GatewayRequest): Promise<GatewayResponse> {
    return new Promise((resolve, reject): void => {
        const options: {
            method?: "POST";
            hostname: string;
            port: number;
            path: string;
            headers: {
                [x: string]: string;
            };
            rejectUnauthorized: boolean;
        } = createBasicOptions(requestOptions);
        const content = JSON.stringify(requestBody);
        options.method = "POST";
        options.headers["Content-Type"] = "application/json";
        options.headers["Content-Length"] = Buffer.byteLength(content).toString();
        const request = https.request(options);
        request.once("response", (response): void => {
            let body: GatewayResponse = {};
            let data = "";
            response.setEncoding("utf8");
            response.on("data", (chunk: string): void => {
                data += chunk;
            });
            response.on("end", (): void => {
                if (response.statusCode !== 200) {
                    if (typeof http.STATUS_CODES[response.statusCode] !== "undefined") {
                        const message = "The gateway returned HTTP/1.1 status code" +
                            ` '${response.statusCode}'.`;
                        return reject(new Error(message));
                    }
                    const message = "The gateway returned HTTP/1.1 status message" +
                        ` '${http.STATUS_CODES[response.statusCode]} (${response.statusCode})'.`;
                    return reject(new Error(message));
                }
                if (!(/^application\/json/).test(response.headers["content-type"])) {
                    const message = "The gateway returned the wrong content type.";
                    return reject(new Error(message));
                }
                try {
                    body = JSON.parse(data);
                } catch (error) {
                    const message = "The gateway returned corrupted content.";
                    return reject(new Error(message));
                }
                if (typeof body.error !== "undefined") {
                    let message = "The gateway returned the error";
                    if (typeof body.error.name !== "undefined") {
                        message += ` [${body.error.name}: ${body.error.message}]`;
                    } else {
                        message += ` ${body.error.message}`;
                    }
                    return reject(new Error(message));
                }
                return resolve(body);
            });
            response.on("error", (error: Error): void => {
                const message = "There was a problem talking to the gateway." +
                    ` The error was [${error.toString()}].`;
                return reject(new Error(message));
            });
        });
        request.on("error", (error: Error): void => {
            const message = "There was a problem talking to the gateway." +
                ` The error was [${error.name}: ${error.message}].`;
            return reject(new Error(message));
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
        // These will be in a database indexed by userId.
        this._hostname = constants.gatewayHostname;
        this._username = "LGTV";
        this._password = constants.gatewayUserPassword;
        this._null = "";
    }

    public static skillPath(): string {
        return "/LGTV/SKILL";
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

    public async sendSkillDirective(request: ASH.Request): Promise<ASH.Response> {
        const options = {
            "hostname": this.hostname,
            "username": this.username,
            "password": this.password,
            "path": "/LGTV/SKILL"
        };
        try {
            const response = ((await sendHandler(options, request)) as ASH.Response);
            const alexaResponse = new ASH.Response(response);
            return alexaResponse;
        } catch (error) {
            return ASH.errorResponseFromError(request, error);
        }
    }

    public send(
        sendOptions: {
            hostname?: string;
            username?: string;
            password?: string;
            path: string;
        },
        request: GatewayRequest
    ): Promise<GatewayResponse> {
        const options = {
            "hostname": typeof sendOptions.hostname !== "undefined"
                ? sendOptions.hostname
                : this.hostname,
            "username": typeof sendOptions.username !== "undefined"
                ? sendOptions.username
                : this.username,
            "password": typeof sendOptions.password !== "undefined"
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
            "path": Gateway.skillPath()
        };
        return pingHandler(options);
    }
}

export {Gateway};