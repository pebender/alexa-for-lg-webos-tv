
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
    const instance = octet;
    const texts = textsList[octet];
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
    callback(null, null);
}

module.exports = {
    "capabilities": capabilities,
    "handler": handler
};