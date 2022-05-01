import * as Common from "../../../common";
import * as Bridge from "./bridge-api";

async function handler(
  alexaRequest: Common.SHS.Request
): Promise<Common.SHS.ResponseWrapper> {
  return await Bridge.sendSkillDirective(alexaRequest);
}

export { handler };
