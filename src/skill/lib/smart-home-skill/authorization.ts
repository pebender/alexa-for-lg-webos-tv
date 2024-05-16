import * as Common from "../../../common";

async function handler(
  alexaRequest: Common.SHS.Request,
): Promise<Common.SHS.Response> {
  return await Promise.resolve(
    Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveNamespace(
      alexaRequest,
    ),
  );
}

export { handler };
