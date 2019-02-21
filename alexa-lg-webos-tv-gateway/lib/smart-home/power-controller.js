const {AlexaResponse} = require("alexa-lg-webos-tv-common");
const {directiveErrorResponse, namespaceErrorResponse} = require("../common");

// eslint-disable-next-line no-unused-vars
function capabilities(lgtvControl, event, udn) {
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

function states(lgtvControl, udn) {
    return new Promise((resolve) => {
        const powerStateState = AlexaResponse.createContextProperty({
            "namespace": "Alexa.PowerController",
            "name": "powerState",
            "value": lgtvControl.getPowerState(udn)
        });
        resolve([powerStateState]);
    });
}

function handler(lgtvControl, event) {
    return new Promise((resolve) => {
        if (event.directive.header.namespace !== "Alexa.PowerController") {
            resolve(namespaceErrorResponse(event, "Alexa.PowerController"));
        }
        switch (event.directive.header.name) {
            case "TurnOff":
                resolve(turnOffHandler(lgtvControl, event));
                break;
            case "TurnOn":
                resolve(turnOnHandler(lgtvControl, event));
                break;
            default:
                resolve(directiveErrorResponse(lgtvControl, event));
                break;
        }
    });
}

function turnOffHandler(lgtvControl, event) {
    return new Promise((resolve, reject) => {
        const {endpointId} = event.directive.endpoint;

        // eslint-disable-next-line no-unused-vars
        lgtvControl.turnOff(endpointId, (error, _response) => {
            if (error) {
                reject(error);
                return;
            }

            const alexaResponse = new AlexaResponse({
                "request": event
            });
            resolve(alexaResponse.get());
        });
    });
}

function turnOnHandler(lgtvControl, event) {
    return new Promise((resolve, reject) => {
        const {endpointId} = event.directive.endpoint;

        // eslint-disable-next-line no-unused-vars
        lgtvControl.turnOn(endpointId, (error, _response) => {
            if (error) {
                reject(error);
                return;
            }

            const alexaResponse = new AlexaResponse({
                "request": event
            });
            resolve(alexaResponse.get());
        });
    });
}

module.exports = {
    "capabilities": capabilities,
    "states": states,
    "handler": handler
};