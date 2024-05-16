import * as CommonError from "../error";
import { copyElement } from "./copy";
import type { Namespace, Header, Endpoint } from "./common";

export interface DirectivePayload {
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

export interface Directive {
  header: Header;
  endpoint?: Endpoint;
  payload: DirectivePayload;
  [x: string]: object | undefined;
}

export class Request {
  public directive: Directive;
  public constructor(opts: {
    directive: {
      header: {
        namespace?: Namespace;
        name?: string;
        instance?: string;
        messageId?: string;
        correlationToken?: string;
        payloadVersion?: "3";
      };
      endpoint?: object;
      payload: DirectivePayload;
    };
  }) {
    this.directive = copyElement(opts.directive) as Directive;
  }

  public getCorrelationToken(): string | undefined {
    return this.directive.header.correlationToken;
  }

  public getEndpointId(): string | undefined {
    return this.directive.endpoint?.endpointId;
  }

  public getAccessToken(): string {
    if (this.directive.endpoint?.scope?.token !== undefined) {
      return this.directive.endpoint.scope.token;
    }
    if (this.directive.payload.scope?.token !== undefined) {
      return this.directive.payload.scope.token;
    }
    if (this.directive.payload.grantee?.token !== undefined) {
      return this.directive.payload.grantee.token;
    }
    throw CommonError.create({
      message: "the SHS Directive has no access token. this should not happen.",
    });
  }
}

export default Request;
