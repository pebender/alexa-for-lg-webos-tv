import * as Common from "../../../common";

function handler(
  alexaRequest: Common.SHS.Request
): Promise<Common.SHS.ResponseWrapper> {
  return Promise.resolve(
    Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveNamespace(
      alexaRequest
    )
  );
}

export { handler };
