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
    const friendlyNames = [];
    let index = 0;
    for (index = 0; index < texts.length; index += 1) {
        friendlyNames.push({
            "@type": "text",
            "value": {
                "text": texts[index],
                "locale": "en-US"
            }
        });
    }

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

function handler(event, callback) {
    if (event.directive.header.namespace !== "Alexa.RangeController") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Range Controller processing in error."
            }
        });
        callback(null, alexaResponse.get());
        return;
    }
    switch (event.directive.header.name) {
        case "SetRangeValue":
            setRangeValueHandler(event, (error, response) => callback(error, response));
            return;
        case "AdjustRangeValue":
            adjustRangeValueHandler(event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(event, (error, response) => callback(error, response));
    }
    callback(null, null);
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

function unknownDirectiveError(event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Range Controller directive ${event.directive.header.name}`
        }
    });
    callback(null, alexaResponse.get());
}

module.exports = {
    "capabilities": capabilities,
    "handler": handler
};