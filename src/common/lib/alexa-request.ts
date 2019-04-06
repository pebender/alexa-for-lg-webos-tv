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
    public constructor(request: {
        directive?: {
            header?: {
                [x: string]: string | undefined;
            };
            endpoint?: object;
            [x: string]: object | undefined;
        };
    }) {
        if (typeof request.directive === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaRequest.directive'.");
        }
        if (typeof request.directive.header === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaRequest.directive.header'.");
        }
        if (typeof request.directive.header.namespace === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaRequest.directive.header.namespace'.");
        }
        if (typeof request.directive.header.name === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaRequest.directive.header.name'.");
        }
        if (typeof request.directive.header.messageId === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaRequest.directive.header.messageId'.");
        }
        if (typeof request.directive.header.payloadVersion === "undefined") {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaRequest.directive.header.payloadVersion'.");
        }
        if ((request.directive.header.payloadVersion === "3") === false) {
            throw new GenericError("error", "parameter(s) initialized 'AlexaRequest.directive.header.payloadVersion' to invalid value '3'.");
        }
        this.directive = (copyElement(request.directive) as AlexaRequestDirective);
    }

    public getCorrelationToken(): string | undefined {
        return this.directive.header.correlationToken;
    }

    public getEndpointId(): string | undefined {
        return this.directive.endpoint && this.directive.endpoint.endpointId;
    }
}