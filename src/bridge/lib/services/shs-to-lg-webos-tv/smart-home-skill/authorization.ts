import * as Common from "../../../../../common";
import type { TvManager } from "../tv-manager";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tvManager: TvManager,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [];
}

function states(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tvManager: TvManager,
): Array<Promise<Common.SHS.ContextProperty>> {
  return [];
}

function handler(
  alexaRequest: Common.SHS.Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tvManager: TvManager,
): Common.SHS.Response {
  return Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveNamespace(
    alexaRequest,
  );
}

export { capabilities, states, handler };
