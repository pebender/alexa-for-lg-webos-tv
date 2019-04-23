import * as ASKModel from "ask-sdk-model";
import * as AWSLambda from "aws-lambda";
import {AlexaRequest,
    AlexaResponse} from "../common";
import {CustomSkill} from "./lib/custom-skill";
import {SmartHomeSkill} from "./lib/smart-home-skill";

const customSkill = new CustomSkill();
const smartHomeSkill = new SmartHomeSkill();

function skilllHandler(request: ASKModel.RequestEnvelope | AlexaRequest, context: ASKModel.Context | AWSLambda.Context, callback: (error: Error | null, response?: AlexaResponse | ASKModel.ResponseEnvelope) => void): Promise<void> {
    if (typeof (request as AlexaRequest).directive !== "undefined") {
        return smartHomeSkill.handler(
            (request as AlexaRequest),
            (context as AWSLambda.Context),
            (error: Error | null, response?: AlexaResponse): void => callback(error, response)
        );
    }
    return Promise.resolve(customSkill.handler(
        (request as ASKModel.RequestEnvelope),
        (context as ASKModel.Context),
        (error: Error | null, response?: ASKModel.ResponseEnvelope): void => callback(error, response)
    ));
}

exports.handler = skilllHandler;