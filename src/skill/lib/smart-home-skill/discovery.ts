import type * as Common from "../../../common";
import * as Bridge from "./bridge-api";

async function handler(
  alexaRequest: Common.SHS.Request,
): Promise<Common.SHS.Response> {
  return await Bridge.sendSkillDirective(alexaRequest);
}

export { handler };
