import * as Common from "../../../../common";
import { Backend } from "../../backend";

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backend: Backend,
): Promise<Common.SHS.EventPayloadEndpointCapability>[] {
  return [];
}

function states(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backend: Backend,
): Promise<Common.SHS.ContextProperty>[] {
  return [];
}

function handler(
  alexaRequest: Common.SHS.Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backend: Backend,
): Common.SHS.ResponseWrapper {
  return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveNamespace(
    alexaRequest,
  );
}

export { capabilities, states, handler };
