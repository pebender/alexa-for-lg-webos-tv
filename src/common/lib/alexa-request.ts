import {GenericError} from "./error-classes";

export class AlexaRequest {
    public directive: {
        header: {
            namespace: string;
            name: string;
            instance?: string;
            messageId: string;
            correlationToken?: string;
            payloadVersion: "3";
            [x: string]: any;
        };
        endpoint?: {
            endpointId: string;
            scope?: {
                type: "BearerToken";
                token: string;
            };
            cookie?: {[x: string]: string};
        };
        payload: {[x: string]: any};
    };
    public constructor(request: {[x: string]: any}) {
        function copyElement(original: any): any {
            let copy: any = null;

            if (original === null || (typeof original === "object") === false) {
                return original;
            }

            if (Array.isArray(original)) {
                copy = [];
                (original as any[]).forEach((item) => {
                    copy.push(copyElement(item));
                });
                return copy;
            }

            if (original instanceof Object) {
                copy = {};
                Object.keys(original).forEach((property) => {
                    copy[property] = copyElement(original[property]);
                });
                return copy;
            }

            throw new GenericError("error", "failed to copy AlexaResponse");
        }

        if (Reflect.has(request, "directive") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.directive'.");
        }
        if (Reflect.has(request.directive, "header") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.directive.header'.");
        }
        if (Reflect.has(request.directive.header, "namespace") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.directive.header.namespace'.");
        }
        if (Reflect.has(request.directive.header, "name") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.directive.header.name'.");
        }
        if (Reflect.has(request.directive.header, "messageId") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.directive.header.messageId'.");
        }
        if (Reflect.has(request.directive.header, "payloadVersion") === false) {
            throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.directive.header.payloadVersion'.");
        }
        if ((request.directive.header.payloadVersion === "3") === false) {
            throw new GenericError("error", "parameter(s) initialized 'AlexaResponse.directive.header.payloadVersion' to invalid value '3'.");
        }
        if (Reflect.has(request.directive, "endpoint")) {
            const {endpoint} = request.directive;
            if (Reflect.has(endpoint, "endpointId") === false) {
                throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.directive.endpoint.endpointId'.");
            }
        }
        this.directive = copyElement(request.directive);
    }

    public getCorrelationToken(): string {
        if (Reflect.has(this.directive.header, "correlationToken")) {
            return this.directive.header.correlationToken;
        }
        // eslint-disable-next-line no-undefined
        return undefined;
    }

    public getEndpointId(): string {
        if (Reflect.has(this.directive, "endpoint") && Reflect.has(this.directive.endpoint, "endpointId")) {
            return this.directive.endpoint.endpointId;
        }
        // eslint-disable-next-line no-undefined
        return undefined;
    }
}