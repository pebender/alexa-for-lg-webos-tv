const {unknownDirectiveError} = require("./common");
const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(event) {
    return new Promise((resolve) => {
        resolve([
            ipAddressOctetCapability("A"),
            ipAddressOctetCapability("B"),
            ipAddressOctetCapability("C"),
            ipAddressOctetCapability("D")
        ]);
    });
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
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
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
        resolve([
            rangeValueStateA,
            rangeValueStateB,
            rangeValueStateC,
            rangeValueStateD
        ]);
    });
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

function setRangeValueHandler(event, callback) {
    switch (event.directive.header.instance) {
        case "A":
            setRangeValueInstanceHandler(event, (error, response) => callback(error, response));
            return;
        case "B":
            setRangeValueInstanceHandler(event, (error, response) => callback(error, response));
            return;
        case "C":
            setRangeValueInstanceHandler(event, (error, response) => callback(error, response));
            return;
        case "D":
            setRangeValueInstanceHandler(event, (error, response) => callback(error, response));
            return;
        default:
            unknownInstanceError(event, (error, response) => callback(error, response));
    }
}

function adjustRangeValueHandler(event, callback) {
    switch (event.directive.header.instance) {
        case "A":
            adjustRangeValueInstanceHandler(event, (error, response) => callback(error, response));
            return;
        case "B":
            adjustRangeValueInstanceHandler(event, (error, response) => callback(error, response));
            return;
        case "C":
            adjustRangeValueInstanceHandler(event, (error, response) => callback(error, response));
            return;
        case "D":
            adjustRangeValueInstanceHandler(event, (error, response) => callback(error, response));
            return;
        default:
            unknownInstanceError(event, (error, response) => callback(error, response));
    }
}

function setRangeValueInstanceHandler(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    callback(null, alexaResponse.get());
}

function adjustRangeValueInstanceHandler(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event
    });
    callback(null, alexaResponse.get());
}

function unknownInstanceError(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Range Controller instance ${event.directive.header.instance}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};