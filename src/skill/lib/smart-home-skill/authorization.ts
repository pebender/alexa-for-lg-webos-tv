import * as Common from "../../../common";

function handler(
  alexaRequest: Common.SHS.Request
): Promise<Common.SHS.Response> {
  throw Common.SHS.Error.errorResponseForInvalidDirectiveNamespace(
    alexaRequest
  );
}

export { handler };
