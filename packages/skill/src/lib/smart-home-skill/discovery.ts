import type * as Common from "@backinthirty/alexa-for-lg-webos-tv-common";
import * as Bridge from "./bridge-api";

async function handler(
  alexaRequest: Common.SHS.Request,
): Promise<Common.SHS.Response> {
  return await Bridge.sendSkillDirective(alexaRequest);
}

export { handler };
