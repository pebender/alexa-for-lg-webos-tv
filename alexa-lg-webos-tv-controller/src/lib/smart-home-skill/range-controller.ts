import {AlexaResponse,
    directiveErrorResponse,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function capabilities(_event): any[] {
    return [
        ipAddressOctetCapability("A"),
        ipAddressOctetCapability("B"),
        ipAddressOctetCapability("C"),
        ipAddressOctetCapability("D")
    ];
}

function ipAddressOctetCapability(octet): any {
    const textsList = {
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
    const texts = textsList[octet];
    const instance = octet;
    const friendlyNames = texts.map((text) => {
        const friendlyName = {
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
        "capabilityResources": {
            "friendlyNames": friendlyNames
        },
        "properties": {
            "supported": [
                {
                    "name": "rangeValue"
                }
            ],
            "proactivelyReported": false,
            "retrievable": true
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

function states(): any {
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

function handler(event): Promise<any> {
    if (event.directive.header.namespace !== "Alexa.RangeController") {
        return Promise.resolve(namespaceErrorResponse(event, event.directive.header.namespace));
    }
    switch (event.directive.header.name) {
        case "SetRangeValue":
            return Promise.resolve(setRangeValueHandler(event));
        case "AdjustRangeValue":
            return Promise.resolve(adjustRangeValueHandler(event));
        default:
            return Promise.resolve(directiveErrorResponse(event, event.directive.header.namespace));
    }
}

function setRangeValueHandler(event): Promise<AlexaResponse> {
    switch (event.directive.header.instance) {
        case "A":
            return setRangeValueInstanceHandler(event);
        case "B":
            return setRangeValueInstanceHandler(event);
        case "C":
            return setRangeValueInstanceHandler(event);
        case "D":
            return setRangeValueInstanceHandler(event);
        default:
            return Promise.resolve(unknownInstanceError(event));
    }
}

function adjustRangeValueHandler(event): Promise<AlexaResponse> {
    switch (event.directive.header.instance) {
        case "A":
            return adjustRangeValueInstanceHandler(event);
        case "B":
            return adjustRangeValueInstanceHandler(event);
        case "C":
            return adjustRangeValueInstanceHandler(event);
        case "D":
            return adjustRangeValueInstanceHandler(event);
        default:
            return Promise.resolve(unknownInstanceError(event));
    }
}

function setRangeValueInstanceHandler(event): Promise<AlexaResponse> {
    return Promise.resolve(new AlexaResponse({
        "request": event
    }));
}

function adjustRangeValueInstanceHandler(event): Promise<AlexaResponse> {
    return Promise.resolve(new AlexaResponse({
        "request": event
    }));
}

function unknownInstanceError(event): AlexaResponse {
    return new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Range Controller instance ${event.directive.header.instance}`
        }
    });
}

export {capabilities, states, handler};