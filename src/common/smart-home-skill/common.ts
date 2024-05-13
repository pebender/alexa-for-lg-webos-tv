export type Namespace =
  | "Alexa"
  | "Alexa.Authorization"
  | "Alexa.Discovery"
  | "Alexa.ChannelController"
  | "Alexa.InputController"
  | "Alexa.Launcher"
  | "Alexa.PlaybackController"
  | "Alexa.PowerController"
  | "Alexa.Speaker";

export interface Header {
  namespace: Namespace;
  name: string;
  instance?: string;
  messageId: string;
  correlationToken?: string;
  payloadVersion: "3";
  [x: string]: string | undefined;
}

export interface Endpoint {
  endpointId: string;
  scope?: {
    type: "BearerToken";
    token: string;
    [x: string]: string;
  };
  cookie?: { [x: string]: string };
  [x: string]: string | object | undefined;
}
