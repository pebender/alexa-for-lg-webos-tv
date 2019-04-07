import {GenericError} from "./error-classes";

type copyElementType = boolean | number | string | object | null | undefined;

export function copyElement(original: copyElementType): copyElementType {
    if (typeof original === "undefined" || original === null || typeof original !== "object") {
        return original;
    }

    if (Array.isArray(original)) {
        const originalArray = (original as copyElementType[]);
        const copy: copyElementType[] = [];
        originalArray.forEach((item) => {
            if (typeof item !== "undefined") {
                copy.push(copyElement(item));
            }
        });
        return copy;
    }

    if (original instanceof Object) {
        const originalObject = (original as {[x: string]: copyElementType});
        const copy: {
            [x: string]: copyElementType;
        } = {};
        Object.keys(originalObject).forEach((property) => {
            if (typeof originalObject[property] !== "undefined") {
                copy[property] = copyElement(originalObject[property]);
            }
        });
        return copy;
    }

    throw new GenericError("error", "failed to copy element");
}

export interface AlexaHeader {
    namespace: string;
    name: string;
    instance?: string;
    messageId: string;
    correlationToken?: string;
    payloadVersion: "3";
    [x: string]: string | undefined;
}

export interface AlexaEndpoint {
    endpointId: string;
    scope?: {
        type: "BearerToken";
        token: string;
        [x: string]: string;
    };
    cookie?: {[x: string]: string};
    [x: string]: string | object | undefined;
}

export interface AlexaRequestDirective {
    header: AlexaHeader;
    endpoint?: AlexaEndpoint;
    payload: {
        [x: string]: boolean | number | string | object;
    };
    [x: string]: object | undefined;
}

export class AlexaRequest {
    public directive: AlexaRequestDirective;
    [x: string]: string | object | undefined;
    public constructor(opts: {
        directive: {
            header?: {
                [x: string]: string | undefined;
            };
            endpoint?: object;
            [x: string]: object | undefined;
            payload: {
                [x: string]: boolean | number | string | object;
            };
        };
    }) {
        if (!(typeof opts.directive === "object")) {
            throw new TypeError("'opts.direct' must be type 'object'");
        }
        if (!(typeof opts.directive.header === "object")) {
            throw new TypeError("'opts.directive.header' must be type 'object'");
        }
        if (!(typeof opts.directive.header.namespace === "string")) {
            throw new TypeError("'opts.directive.header.namespace' must be type 'string'");
        }
        if (!(typeof opts.directive.header.name === "string")) {
            throw new TypeError("'opts.directive.header.name' must be type 'string'");
        }
        if (!(typeof opts.directive.header.instance === "string" ||
              typeof opts.directive.header.instance === "undefined")) {
            throw new TypeError("'opts.directive.header.instance' must be type 'string'");
        }
        if (!(typeof opts.directive.header.messageId === "string")) {
            throw new TypeError("'opts.directive.header.messageId' must be type 'string'");
        }
        if (!(typeof opts.directive.header.correlationToken === "string" ||
              typeof opts.directive.header.correlationToken === "undefined")) {
            throw new TypeError("'opts.directive.header.correlationToken' must be type 'string' when set");
        }
        if (!(typeof opts.directive.header.payloadVersion === "string")) {
            throw new TypeError("'opts.directive.header.payloadVersion' must be type 'string'");
        }
        if (!(opts.directive.header.payloadVersion === "3")) {
            throw new RangeError("'opts.directive.header.payloadVersion' must be a 'string' of '3'.");
        }
        if (!(typeof opts.directive.endpoint === "object" ||
              typeof opts.directive.endpoint === "undefined")) {
            throw new TypeError("'opts.directive.endpoint' requires type 'object' when set");
        }
        if (!(typeof opts.directive.payload === "object")) {
            throw new TypeError("'opts.directive.payload' requires type 'object'");
        }

        this.directive = (copyElement(opts.directive) as AlexaRequestDirective);
    }

    public getCorrelationToken(): string | undefined {
        return this.directive.header.correlationToken;
    }

    public getEndpointId(): string | undefined {
        return this.directive.endpoint && this.directive.endpoint.endpointId;
    }
}