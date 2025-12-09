import * as Common from "@backinthirty/alexa-for-lg-webos-tv-common";
import type { TvManager } from "../tv-manager";

function capabilities(
  tvManager: TvManager,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [];
}

function states(
  tvManager: TvManager,
): Array<Promise<Common.SHS.ContextProperty>> {
  return [];
}

function handler(
  alexaRequest: Common.SHS.Request,
  tvManager: TvManager,
): Common.SHS.Response {
  return Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveNamespace(
    alexaRequest,
  );
}

export { capabilities, states, handler };
