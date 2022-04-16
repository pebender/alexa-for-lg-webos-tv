export type AlexaMessageNamespace = string;

export interface AlexaMessageHeader {
  namespace: AlexaMessageNamespace;
  name: string;
  instance?: string;
  messageId: string;
  correlationToken?: string;
  payloadVersion: '3';
  [x: string]: string | undefined;
}

export interface AlexaMessageEndpoint {
  endpointId: string;
  scope?: {
    type: 'BearerToken';
    token: string;
    [x: string]: string;
  };
  cookie?: {[x: string]: string};
  [x: string]: string | object | undefined;
}
