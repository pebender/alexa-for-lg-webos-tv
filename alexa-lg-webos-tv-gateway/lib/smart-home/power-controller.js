const {AlexaResponse} = require("alexa-lg-webos-tv-common");

// eslint-disable-next-line no-unused-vars
function capabilities(_lgtvControl, _event, _udn) {
    return {
        "type": "AlexaInterface",
        "interface": "Alexa.PowerController",
        "version": "3"
    };
}

function handler(lgtvControl, event, callback) {
    if (event.directive.header.namespace !== "Alexa.PowerController") {
        const alexaResponse = new AlexaResponse({
            "request": event,
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "You were sent to Power Controller processing in error."
            }
        });
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
        return;
    }
    switch (event.directive.header.name) {
        case "TurnOff":
            turnOffHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        case "TurnOn":
            turnOnHandler(lgtvControl, event, (error, response) => callback(error, response));
            return;
        default:
            unknownDirectiveError(lgtvControl, event, (error, response) => callback(error, response));
    }
}

function turnOffHandler(lgtvControl, event, callback) {
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
            const alexaEvent = {"event": alexaResponse.get().event};
            callback(null, alexaEvent);
            return;
        }

        const alexaResponse = new AlexaResponse({
            "request": event
        });
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
    });
}

function turnOnHandler(lgtvControl, event, callback) {
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
            const alexaEvent = {"event": alexaResponse.get().event};
            callback(null, alexaEvent);
            return;
        }

        const alexaResponse = new AlexaResponse({
            "request": event
        });
        const alexaEvent = {"event": alexaResponse.get().event};
        callback(null, alexaEvent);
    });
}

function unknownDirectiveError(lgtvControl, event, callback) {
    const alexaResponse = new AlexaResponse({
        "request": event,
        "name": "ErrorResponse",
        "payload": {
            "type": "INTERNAL_ERROR",
            "message": `I do not know the Power Controller directive ${event.directive.header.name}`
        }
    });
    const alexaEvent = {"event": alexaResponse.get().event};
    callback(null, alexaEvent);
}

module.exports = {
    "capabilities": capabilities,
    "handler": handler
};