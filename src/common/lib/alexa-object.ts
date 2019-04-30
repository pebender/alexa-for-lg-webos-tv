
import * as ASH from "../alexa";

export interface AlexaSmartHomeCapabilities {
    (): Promise<ASH.ResponseEventPayloadEndpointCapability>[];
}
export interface AlexSmartHomeStates {
    (): Promise<ASH.ResponseContextProperty>[];
}
export interface AlexaSmartHomeHandler {
    (alexaRequest: ASH.Request): Promise<ASH.Response>;
}

export class AlexaSmartHomeObject {
    public readonly namespace: string;
    public readonly handlers: {[x: string]: (alexaRequest: ASH.Request) => Promise<ASH.Response>}
    public constructor(namespace: string, handlers:  {[x: string]: (alexaRequest: ASH.Request) => Promise<ASH.Response>}) {
        this.namespace = namespace;
        this.handlers = handlers;
    }

    public capabilities(): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
        return [
            Promise.resolve({
                "type": "AlexaInterface",
                "interface": this.namespace,
                "version": "3"
            })
        ];
    }

    public states(): Promise<ASH.ResponseContextProperty>[] {
        return [];
    }

    public handler(alexaRequest: ASH.Request): Promise<ASH.Response> {
        if (Reflect.has(this.handlers, alexaRequest.directive.header.name)) {
            return this.handlers[alexaRequest.directive.header.name](alexaRequest);
        }
        return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
    }
}