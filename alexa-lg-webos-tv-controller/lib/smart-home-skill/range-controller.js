const {unknownDirectiveError} = require("./common");
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
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.RangeController") {
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": "You were sent to Range Controller processing in error."
                }
            });
            resolve(alexaResponse.get());
            return;
        }
        switch (event.directive.header.name) {
            case "SetRangeValue":
                resolve(setRangeValueHandler(event));
                return;
            case "AdjustRangeValue":
                resolve(adjustRangeValueHandler(event));
                return;
            default:
                resolve(unknownDirectiveError(event));
        }
    });
}

function setRangeValueHandler(event) {
    return new Promise((resolve) => {
        switch (event.directive.header.instance) {
            case "A":
                resolve(setRangeValueInstanceHandler(event));
                return;
            case "B":
                resolve(setRangeValueInstanceHandler(event));
                return;
            case "C":
                resolve(setRangeValueInstanceHandler(event));
                return;
            case "D":
                resolve(setRangeValueInstanceHandler(event));
                return;
            default:
                resolve(unknownInstanceError(event));
        }
    });
}

function adjustRangeValueHandler(event) {
    return new Promise((resolve) => {
        switch (event.directive.header.instance) {
            case "A":
                resolve(adjustRangeValueInstanceHandler(event));
                return;
            case "B":
                resolve(adjustRangeValueInstanceHandler(event));
                return;
            case "C":
                resolve(adjustRangeValueInstanceHandler(event));
                return;
            case "D":
                resolve(adjustRangeValueInstanceHandler(event));
                return;
            default:
                resolve(unknownInstanceError(event));
        }
    });
}

function setRangeValueInstanceHandler(event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event
        });
        resolve(alexaResponse.get());
    });
}

function adjustRangeValueInstanceHandler(event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event
        });
        resolve(alexaResponse.get());
    });
}

function unknownInstanceError(event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": `I do not know the Range Controller instance ${event.directive.header.instance}`
            }
        });
        resolve(alexaResponse.get());
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};