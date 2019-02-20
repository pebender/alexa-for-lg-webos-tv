const {AlexaResponse} = require("alexa-lg-webos-tv-common");

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
            const alexaResponse = new AlexaResponse({
                "request": event,
                "name": "ErrorResponse",
                "payload": {
                    "type": "INTERNAL_ERROR",
                    "message": "You were sent to Power Controller processing in error."
                }
            });
            resolve(alexaResponse.get());
            return;
        }
        switch (event.directive.header.name) {
            case "TurnOff":
                resolve(turnOffHandler(lgtvControl, event));
                break;
            case "TurnOn":
                resolve(turnOnHandler(lgtvControl, event));
                break;
            default:
                resolve(unknownDirectiveError(lgtvControl, event));
                break;
        }
    });
}

function turnOffHandler(lgtvControl, event) {
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;

        // eslint-disable-next-line no-unused-vars
        lgtvControl.turnOff(endpointId, (error, _response) => {
            if (error) {
                const alexaResponse = new AlexaResponse({
                    "request": event,
                    "name": "ErrorResponse",
                    "payload": {
                        "type": "INTERNAL_ERROR",
                        "message": `${error.name}: ${error.message}.`
                    }
                });
                resolve(alexaResponse.get());
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
    return new Promise((resolve) => {
        const {endpointId} = event.directive.endpoint;

        // eslint-disable-next-line no-unused-vars
        lgtvControl.turnOn(endpointId, (error, _response) => {
            if (error) {
                const alexaResponse = new AlexaResponse({
                    "request": event,
                    "name": "ErrorResponse",
                    "payload": {
                        "type": "INTERNAL_ERROR",
                        "message": `${error.name}: ${error.message}.`
                    }
                });
                resolve(alexaResponse.get());
                return;
            }

            const alexaResponse = new AlexaResponse({
                "request": event
            });
            resolve(alexaResponse.get());
        });
    });
}

function unknownDirectiveError(lgtvControl, event) {
    return new Promise((resolve) => {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": `I do not know the Alexa Power Controller directive ${event.directive.header.name}`
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