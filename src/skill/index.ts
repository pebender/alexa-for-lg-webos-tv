import type * as ASKModel from "ask-sdk-model";
import type * as AWSLambda from "aws-lambda";
import * as Common from "../common";
import { handler as customSkillHandler } from "./lib/custom-skill";
import { handler as smartHomeSkillHandler } from "./lib/smart-home-skill";

async function skillHandler(
  request: ASKModel.RequestEnvelope | Common.SHS.Request,
  context: ASKModel.Context | AWSLambda.Context,
): Promise<ASKModel.ResponseEnvelope | Common.SHS.Response> {
  Common.Debug.debugJSON(request);
  if ("session" in request) {
    let response: ASKModel.ResponseEnvelope | undefined = undefined;
    try {
      response = await customSkillHandler(request, context as ASKModel.Context);
    } catch (error) {
      Common.Debug.debugError(error);
      throw error;
    }

    Common.Debug.debugJSON(response);

    return response;
  }

  if ("directive" in request) {
    let response: Common.SHS.Response | undefined = undefined;
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

  const error = new Common.GeneralCommonError({
    message: "Unhandled request",
  });
  Common.Debug.debugError(error);
  throw error;
}

export { skillHandler as handler };
