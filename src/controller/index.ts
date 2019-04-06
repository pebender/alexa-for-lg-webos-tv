import * as ASKModel from "ask-sdk-model";
import * as AWSLambda from "aws-lambda";
import * as customSkill from "./lib/custom-skill";
import * as smartHomeSkill from "./lib/smart-home-skill";
import {AlexaRequest,
    AlexaResponse} from "../common";

async function smartHomeSkillHandler(event: AlexaRequest, context: AWSLambda.Context, callback: (error: Error | null, response: AlexaResponse | null) => void): Promise<void> {
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

function skilllHandler(request: any, context: AWSLambda.Context, callback: (error: Error | null, response: AlexaResponse | ASKModel.ResponseEnvelope | null) => void): Promise<void> {
    if (typeof request.directive !== "undefined") {
        return smartHomeSkillHandler((request as AlexaRequest), context, (error, response) => callback(error, response));
    }
    return Promise.resolve(customSkill.handler((request as ASKModel.RequestEnvelope), context, (error: Error, response: ASKModel.ResponseEnvelope) => callback(error, response)));
}


exports.handler = skilllHandler;