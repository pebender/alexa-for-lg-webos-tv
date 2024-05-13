import * as ASKModel from "ask-sdk-model";
import * as AWSLambda from "aws-lambda";
import * as Common from "../common";
import { handler as customSkillHandler } from "./lib/custom-skill";
import { handler as smartHomeSkillHandler } from "./lib/smart-home-skill";

async function skillHandler(
  request: ASKModel.RequestEnvelope | Common.SHS.Request,
  context: ASKModel.Context | AWSLambda.Context,
): Promise<ASKModel.ResponseEnvelope | Common.SHS.Response> {
  Common.Debug.debugJSON(request);
  let response: ASKModel.ResponseEnvelope | Common.SHS.Response;
  if ("session" in request) {
    try {
      response = await customSkillHandler(
        request as ASKModel.RequestEnvelope,
        context as ASKModel.Context,
      );
    } catch (error) {
      Common.Debug.debugError(error);
      throw error;
    }

    Common.Debug.debugJSON(response);

    return response;
  }

  if ("directive" in request) {
    try {
      response = await smartHomeSkillHandler(
        request,
        context as AWSLambda.Context,
      );
    } catch (error) {
      Common.Debug.debugError(error);
      throw error;
    }

    Common.Debug.debugJSON(response);

    return response;
  }

  const error = Common.Error.create({ message: "Unhandled request" });
  Common.Debug.debugError(error);
  throw error;
}

export { skillHandler as handler };
