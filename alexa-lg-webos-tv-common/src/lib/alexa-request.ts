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
            cookie: {[x: string]: any};
        };
        payload: {[x: string]: any};
    };
    public constructor(request: {[x: string]: any}) {
        function copyElement(original: any): any {
            let copy: any = null;

            if (original === null || (typeof original === "object") === false) {
                return original;
            }

            if (original instanceof Array) {
                copy = [];
                (copy as any[]).forEach((item) => {
                    copy.push(item);
                });
                return copy;
            }

            if (original instanceof Object) {
                copy = {};
                for (const property in original) {
                    if (original.hasOwnProperty(property)) {
                        copy[property] = copyElement(original[property]);
                    }
                }
                return copy;
            }

            throw new GenericError("error", "failed to copy AlexaRequest");
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
}