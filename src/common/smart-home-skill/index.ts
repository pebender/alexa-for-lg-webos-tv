import schema from "./alexa_smart_home_message_schema.json";
export { schema };

export { Namespace, Header, Endpoint } from "./common";
export { Request, Directive, DirectivePayload } from "./request";
export {
  Response,
  Event,
  EventPayload,
  EventPayloadEndpoint,
  EventPayloadEndpointCapability,
  Context,
  ContextProperty,
} from "./response";
export { ResponseWrapper } from "./response-wrapper";
