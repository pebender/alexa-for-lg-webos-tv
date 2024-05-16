import schema from "./alexa_smart_home_message_schema.json";

// eslint-disable-next-line unicorn/prefer-export-from
export { schema };

export type { Namespace, Header, Endpoint } from "./common";
export { Request, type Directive, type DirectivePayload } from "./request";
export {
  Response,
  type Event,
  type EventPayload,
  type EventPayloadEndpoint,
  type EventPayloadEndpointCapability,
  type Context,
  type ContextProperty,
} from "./response";
