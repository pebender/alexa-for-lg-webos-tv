import * as ASKModel from "ask-sdk-model";
import * as ASH from "../common/alexa";
import * as AWSLambda from "aws-lambda";
import {CustomSkill} from "./lib/custom-skill";
import {SmartHomeSkill} from "./lib/smart-home-skill";

const customSkill = new CustomSkill();
const smartHomeSkill = new SmartHomeSkill();

function skilllHandler(request: ASKModel.RequestEnvelope | ASH.Request, context: ASKModel.Context | AWSLambda.Context, callback: (error: Error | null, response?: ASH.Response | ASKModel.ResponseEnvelope) => void): Promise<void> {
    if (typeof (request as ASH.Request).directive !== "undefined") {
        return smartHomeSkill.handler(
            (request as ASH.Request),
            (context as AWSLambda.Context),
            (error: Error | null, response?: ASH.Response): void => callback(error, response)
        );
    }
    return Promise.resolve(customSkill.handler(
        (request as ASKModel.RequestEnvelope),
        (context as ASKModel.Context),
        (error: Error | null, response?: ASKModel.ResponseEnvelope): void => callback(error, response)
    ));
}

exports.handler = skilllHandler;