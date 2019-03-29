import * as customSkill from "./lib/custom-skill";
import * as smartHomeSkill from "./lib/smart-home-skill";
import {AlexaRequest,
    AlexaResponse} from "../common";

async function smartHomeSkillHandler(event: AlexaRequest, context: any, callback: (error: Error, response: AlexaResponse) => void): Promise<void> {
    try {
        const response = await smartHomeSkill.handler(event, context);
        callback(null, response);
        return;
    } catch (error) {
        callback(error, null);
        // eslint-disable-next-line no-useless-return
        return;
    }
}

function skilllHandler(event: any, context: any, callback: (error: Error, response: any) => void): Promise<void> {
    if (Reflect.has(event, "directive")) {
        return smartHomeSkillHandler(event, context, (error, response) => callback(error, response));
    }
    return Promise.resolve(customSkill.handler(event, context, (error, response) => callback(error, response)));
}


exports.handler = skilllHandler;