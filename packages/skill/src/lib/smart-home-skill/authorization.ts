import * as Common from "@backinthirty/alexa-for-lg-webos-tv-common";

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
