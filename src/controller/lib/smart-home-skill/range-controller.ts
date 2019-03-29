import {AlexaRequest,
    AlexaResponse,
    AlexaResponseContextProperty,
    AlexaResponseEventPayloadEndpointCapability,
    directiveErrorResponse,
    errorResponse,
    namespaceErrorResponse} from "../../../common";

function ipAddressOctetCapability(octet: "A" | "B" | "C" | "D"): AlexaResponseEventPayloadEndpointCapability {
    const textsList: {[x: string]: string[]} = {
        "A": [
            "Alpha",
            "A"
        ],
        "B": [
            "Bravo",
            "B"
        ],
        "C": [
            "Charlie",
            "C"
        ],
        "D": [
            "Delta",
            "D"
        ]
    };
    const texts: string[] = textsList[octet];
    const instance = octet;
    const friendlyNames = texts.map((text: string) => {
        const friendlyName: {
            "@type": "text";
            "value": {
                "text": string;
                "locale": "en-US";
            };
        } = {
            "@type": "text",
            "value": {
                "text": text,
                "locale": "en-US"
            }
        };
        return friendlyName;
    });

    return {
        "type": "AlexaInterface",
        "interface": "Alexa.RangeController",
        "version": "3",
        "instance": instance,
        "properties": {
            "supported": [
                {
                    "name": "rangeValue"
                }
            ],
            "proactivelyReported": false,
            "retrievable": true
        },
        "capabilityResources": {
            "friendlyNames": friendlyNames
        },
        "configuration": {
            "supportedRange": {
                "minimumValue": 0,
                "maximumValue": 255,
                "precision": 1
            }
        }
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_alexaRequest: AlexaRequest): AlexaResponseEventPayloadEndpointCapability[] {
    return [
        ipAddressOctetCapability("A"),
        ipAddressOctetCapability("B"),
        ipAddressOctetCapability("C"),
        ipAddressOctetCapability("D")
    ];
}

function states(): AlexaResponseContextProperty[] {
    const rangeValueStateA = AlexaResponse.createContextProperty({
        "namespace": "Alexa.RangeController",
        "instance": "A",
        "name": "rangeValue",
        "value": "0"
    });
    const rangeValueStateB = AlexaResponse.createContextProperty({
        "namespace": "Alexa.RangeController",
        "instance": "B",
        "name": "rangeValue",
        "value": "0"
    });
    const rangeValueStateC = AlexaResponse.createContextProperty({
        "namespace": "Alexa.RangeController",
        "instance": "C",
        "name": "rangeValue",
        "value": "0"
    });
    const rangeValueStateD = AlexaResponse.createContextProperty({
        "namespace": "Alexa.RangeController",
        "instance": "D",
        "name": "rangeValue",
        "value": "0"
    });
    return [
        rangeValueStateA,
        rangeValueStateB,
        rangeValueStateC,
        rangeValueStateD
    ];
}

function setRangeValueInstanceHandler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return Promise.resolve(new AlexaResponse({
        "request": alexaRequest
    }));
}

function adjustRangeValueInstanceHandler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return Promise.resolve(new AlexaResponse({
        "request": alexaRequest
    }));
}

function unknownInstanceError(alexaRequest: AlexaRequest): AlexaResponse {
    const message = `I do not know the Range Controller instance ${alexaRequest.directive.header.instance}`;
    return errorResponse(alexaRequest, "INTERNAL_ERROR", message);
}

function setRangeValueHandler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    switch (alexaRequest.directive.header.instance) {
        case "A":
            return setRangeValueInstanceHandler(alexaRequest);
        case "B":
            return setRangeValueInstanceHandler(alexaRequest);
        case "C":
            return setRangeValueInstanceHandler(alexaRequest);
        case "D":
            return setRangeValueInstanceHandler(alexaRequest);
        default:
            return Promise.resolve(unknownInstanceError(alexaRequest));
    }
}

function adjustRangeValueHandler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    switch (alexaRequest.directive.header.instance) {
        case "A":
            return adjustRangeValueInstanceHandler(alexaRequest);
        case "B":
            return adjustRangeValueInstanceHandler(alexaRequest);
        case "C":
            return adjustRangeValueInstanceHandler(alexaRequest);
        case "D":
            return adjustRangeValueInstanceHandler(alexaRequest);
        default:
            return Promise.resolve(unknownInstanceError(alexaRequest));
    }
}

function handler(alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.RangeController") {
        return Promise.resolve(namespaceErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
    }
    switch (alexaRequest.directive.header.name) {
        case "SetRangeValue":
            return Promise.resolve(setRangeValueHandler(alexaRequest));
        case "AdjustRangeValue":
            return Promise.resolve(adjustRangeValueHandler(alexaRequest));
        default:
            return Promise.resolve(directiveErrorResponse(alexaRequest, alexaRequest.directive.header.namespace));
    }
}

export {capabilities, states, handler};