// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as ASH from  "../../../common/alexa";
import {BackendControl} from "../backend";

export interface LGTVSmartHome {
    capabilities: (backendControl: BackendControl) => Promise<ASH.ResponseEventPayloadEndpointCapability>[];
    states: (backendControl: BackendControl) => Promise<ASH.ResponseContextProperty>[];
    handler: (alexaRequest: ASH.Request, backendControl: BackendControl) => Promise<ASH.Response>;
}

export function capabilities(
    backendControl: BackendControl,
    namespace: string,
    handlers: {
        propertyNames?: string[];
        supportedOperations?: string[];
    }
): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
    const result: ASH.ResponseEventPayloadEndpointCapability = {
        "type": "AlexaInterface",
        "interface": namespace,
        "version": "3"
    };
    if (typeof handlers.propertyNames !== "undefined") {
        result.properties = {
            "supported": handlers.propertyNames.map((property): {"name": string} => ({"name": property})),
            "proactivelyReported": false,
            "retrievable": true
        };
    }
    if (typeof handlers.supportedOperations !== "undefined") {
        result.supportedOperations = [...handlers.supportedOperations];
    }
    return [Promise.resolve(result)];
}

export function states(
    namespace: string,
    stateHandlers: {
        [state: string]: () => boolean | string;
    }
): Promise<ASH.ResponseContextProperty>[] {
    return Object.keys(stateHandlers).map(async (key): Promise<ASH.ResponseContextProperty> => ASH.Response.buildContextProperty({
        "namespace": namespace,
        "name": key,
        "value": (): boolean | string => stateHandlers[key]()
    }));
}

export function handler(
    alexaRequest: ASH.Request,
    namespace: string,
    directiveHandlers: {
        [name: string]: (alexaRequest: ASH.Request, namespace: string) => Promise<ASH.Response>;
    }
): Promise<ASH.Response> {
    const {name} = alexaRequest.directive.header;
    if (Reflect.has(directiveHandlers, name)) {
        return directiveHandlers[name](alexaRequest, namespace);
    }
    return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest));
}