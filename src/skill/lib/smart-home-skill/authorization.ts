import * as Common from "../../../common";

function handler(
  alexaRequest: Common.SHS.Request,
): Promise<Common.SHS.Response> {
  return Promise.resolve(
    Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveNamespace(
      alexaRequest,
    ),
  );
}

export { handler };
