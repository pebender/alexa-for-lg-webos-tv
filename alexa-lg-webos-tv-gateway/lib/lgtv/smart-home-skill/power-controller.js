const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("../../common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtv, _event, _udn) {
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

function states(lgtv, udn) {
    return new Promise((resolve) => {
        const powerStateState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.PowerController",
            "name": "powerState",
            "value": lgtv.getPowerState(udn)
        });
        resolve([powerStateState]);
    });
}

function handler(lgtv, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.PowerController") {
            resolve(namespaceErrorResponse(event, "Alexa.PowerController"));
        }
        switch (event.directive.header.name) {
            case "TurnOff":
                resolve(turnOffHandler(lgtv, event));
                break;
            case "TurnOn":
                resolve(turnOnHandler(lgtv, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtv, event));
                break;
        }
    });
}

function turnOffHandler(lgtv, event) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;

        resolve(lgtv.turnOff(endpointId).
            then(() => {
                const alexaResponse = new AlexaResponse({
                    "request": event
                });
                return alexaResponse.get();
            }));
    });
}

function turnOnHandler(lgtv, event) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;

        resolve(lgtv.turnOn(endpointId).
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