const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("../common");

// eslint-disable-next-line no-unused-vars
function capabilities(lgtvController, event, udn) {
    return new Promise((resolve) => {
         resolve({
            "type": "AlexaInterface",
            "interface": "Alexa.PowerController",
            "version": "3",
            "properties": {
                "supported": [
                    {
                        "name": "powerState"
                    }
                ],
                "proactivelyReported": false,
                "retrievable": true
            }
        });
    });
}

function states(lgtvController, udn) {
    return new Promise((resolve) => {
        const powerStateState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.PowerController",
            "name": "powerState",
            "value": lgtvController.getPowerState(udn)
        });
        resolve([powerStateState]);
    });
}

function handler(lgtvController, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.PowerController") {
            resolve(namespaceErrorResponse(event, "Alexa.PowerController"));
        }
        switch (event.directive.header.name) {
            case "TurnOff":
                resolve(turnOffHandler(lgtvController, event));
                break;
            case "TurnOn":
                resolve(turnOnHandler(lgtvController, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtvController, event));
                break;
        }
    });
}

function turnOffHandler(lgtvController, event) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;

        resolve(lgtvController.turnOff(endpointId).
            then(() => {
                const alexaResponse = new AlexaResponse({
                    "request": event
                });
                return alexaResponse.get();
            }));
    });
}

function turnOnHandler(lgtvController, event) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;

        resolve(lgtvController.turnOn(endpointId).
            then(() => {
                const alexaResponse = new AlexaResponse({
                    "request": event
                });
                return alexaResponse.get();
            }));
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};