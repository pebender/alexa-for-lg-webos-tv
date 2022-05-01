import * as Common from "../../../../common";
import { Backend } from "../../backend";

function capabilities(
  backend: Backend
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [];
}

function states(backend: Backend): Promise<Common.SHS.Context.Property>[] {
  return [];
}

function handler(
  alexaRequest: Common.SHS.Request,
  backend: Backend
): Common.SHS.ResponseWrapper {
  return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveNamespace(
    alexaRequest
  );
}

export { capabilities, states, handler };
