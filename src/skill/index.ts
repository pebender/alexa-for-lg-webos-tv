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
    response = await customSkillHandler(
      request as ASKModel.RequestEnvelope,
      context as ASKModel.Context,
    );
    Common.Debug.debugJSON(response);

    return response;
  }

  if ("directive" in request) {
    response = await smartHomeSkillHandler(
      request as Common.SHS.Request,
      context as AWSLambda.Context,
    );
    Common.Debug.debugJSON(response);

    return response;
  }

  throw new Error("Unhandled request");
}

export { skillHandler as handler };
