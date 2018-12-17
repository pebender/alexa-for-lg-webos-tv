const httpPost = require('../gateway-api/index.js');

async function runLGTVCommand(handlerInput, command) {
    let attributes = {};
    try {
        attributes = await handlerInput.attributesManager.getPersistentAttributes();
    } catch (error) {
        throw error;
    }
    if (!Reflect.has(attributes, 'hostname')) {
        throw new Error('I need to know your gateway\'s hostname before I can control any televisions.');
    }
    if (!Reflect.has(attributes, 'password')) {
        throw new Error('I need to know your gateway\'s password before I can control any televisions.');
    }

// eslint-disable-next-line capitalized-comments
/*
 *   if (!Reflect.has(attributes, 'tvmap') || !Reflect.has(attributes.tvmap, handlerInput.requestEnvelope.context.System.device.deviceId)) {
 *        const error = new Error('You have not configured this Alexa to control an L.G. web O.S. T.V..');
 *        throw error;
 *    }
 */
    try {
        const options = {
            'hostname': attributes.hostname,
            'path': '/LGTV/RUN',
            'username': 'LGTV',
            'password': attributes.password
        };
        const request = {

/*
 *            'television': attributes[handlerInput.requestEnvelope.context.System.device.deviceId],
 * Hack until I get LGTV binding to work. This is the UDN specific to my television.
 */
            'television': 'uuid:261b0bf7-1437-ed2d-5eaf-ab701fd699e3',
            'command': command
        };
        return await httpPost.post(options, request);
    } catch (error) {
        throw (error);
    }
}

function checkSlotStatusCode(slot) {
    const match =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH';
    return match;
}

function getSlotName(slot) {
    const name =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0] &&
        slot.resolutions.resolutionsPerAuthority[0].values &&
        slot.resolutions.resolutionsPerAuthority[0].values.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    return name;
}

function getSlotId(slot) {
    const id =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0] &&
        slot.resolutions.resolutionsPerAuthority[0].values &&
        slot.resolutions.resolutionsPerAuthority[0].values.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    return id;
}

module.exports = {
    'runLGTVCommand': runLGTVCommand,
    'checkSlotStatusCode': checkSlotStatusCode,
    'getSlotName': getSlotName,
    'getSlotId': getSlotId
};
