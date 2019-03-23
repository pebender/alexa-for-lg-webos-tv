import {GenericError} from "./error-classes";

export class AlexaRequest {
    directive: {
        header: {
            namespace: string,
            name: string,
            instance?: string,
            messageId: string,
            correlationToken?: string,
            payloadVersion: "3"
            [x: string]: any
        },
        endpoint?: {
            endpointId: string,
            scope?: {
                type: "BearerToken",
                token: string
            },
            cookie: {[x: string]: any}
        },
        payload: {[x: string]: any}
    };
    constructor(request: {[x: string]: any}) {
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
        if ((request.directive, "endpoint")) {
            let endpoint: {[x: string]: any} = request.directive.endpoint;
            if (Reflect.has(endpoint, "endpointId") === false) {
                throw new GenericError("error", "missing parameter(s) needed to initialize 'AlexaResponse.directive'.");
            }
        }
        this.directive = copyElement(request.directive);

        function copyElement(original: any): any {
            let copy: any;
        
            if (original === null || (typeof original === "object") === false) {
                return original;
            }
        
            if (original instanceof Array) {
                copy = [];
                (copy as Array<any>).forEach((item) => {
                    copy.push(item);
                });
                return copy;
            }
        
            if (original instanceof Object) {
                copy = {};
                for (let property in original) {
                    if (original.hasOwnProperty(property)) {
                        copy[property] = copyElement(original[property]);
                    }
                }
                return copy;
            }
        
            throw new GenericError("error", "failed to copy AlexaRequest");
        }
    }
};