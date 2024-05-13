/* eslint-disable @typescript-eslint/no-namespace */
import * as CommonError from "../error";
import { copyElement } from "./copy";

export namespace SHSDirective {
  export namespace Header {
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
  }
  export interface Header {
    namespace: Header.Namespace;
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
  export interface Payload {
    scope?: {
      type: "BearerToken";
      token: string;
    };
    grant?: {
      type: "OAuth2.AuthorizationCode";
      code: string;
    };
    grantee?: {
      type: "BearerToken";
      token: string;
    };
    [x: string]: boolean | number | string | [] | object | undefined;
  }
}
export interface SHSDirective {
  header: SHSDirective.Header;
  endpoint?: SHSDirective.Endpoint;
  payload: SHSDirective.Payload;
  [x: string]: object | undefined;
}

export class SHSRequest {
  public directive: SHSDirective;
  [x: string]: object | undefined;
  public constructor(opts: {
    directive: {
      header: {
        namespace?: SHSDirective.Header.Namespace;
        name?: string;
        instance?: string;
        messageId?: string;
        correlationToken?: string;
        payloadVersion?: "3";
      };
      endpoint?: object;
      payload: SHSDirective.Payload;
    };
  }) {
    this.directive = copyElement(opts.directive) as SHSDirective;
  }

  public getCorrelationToken(): string | undefined {
    return this.directive.header.correlationToken;
  }

  public getEndpointId(): string | undefined {
    return this.directive.endpoint?.endpointId;
  }

  public getAccessToken(): string {
    if (typeof this.directive.endpoint?.scope?.token !== "undefined") {
      return this.directive.endpoint.scope.token;
    }
    if (typeof this.directive.payload.scope?.token !== "undefined") {
      return this.directive.payload.scope.token;
    }
    if (typeof this.directive.payload.grantee?.token !== "undefined") {
      return this.directive.payload.grantee.token;
    }
    throw CommonError.create(
      "the SHS Directive has no access token. this should not happen.",
    );
  }
}
