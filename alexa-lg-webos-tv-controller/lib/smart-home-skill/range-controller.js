const {namespaceErrorResponse, directiveErrorResponse} = require("alexa-lg-webos-tv-common");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(event) {
    return [
        ipAddressOctetCapability("A"),
        ipAddressOctetCapability("B"),
        ipAddressOctetCapability("C"),
        ipAddressOctetCapability("D")
    ];
}

function ipAddressOctetCapability(octet) {
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

function states() {
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

function handler(event) {
    if (event.directive.header.namespace !== "Alexa.RangeController") {
        return namespaceErrorResponse(event, event.directive.header.namespace);
    }
    switch (event.directive.header.name) {
        case "SetRangeValue":
            return setRangeValueHandler(event);
        case "AdjustRangeValue":
            return adjustRangeValueHandler(event);
        default:
            return directiveErrorResponse(event, event.directive.header.namespace);
    }
}

function setRangeValueHandler(event) {
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
                return unknownInstanceError(event);
        }
}

function adjustRangeValueHandler(event) {
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
                return unknownInstanceError(event);
        }
}

function setRangeValueInstanceHandler(event) {
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    return alexaResponse.get();
}

function adjustRangeValueInstanceHandler(event) {
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    return alexaResponse.get();
}

function unknownInstanceError(event) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Range Controller instance ${event.directive.header.instance}`
        }
    });
    return alexaResponse.get();
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};