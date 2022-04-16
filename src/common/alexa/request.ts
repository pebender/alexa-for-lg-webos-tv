import {
  AlexaMessageEndpoint,
  AlexaMessageHeader,
  AlexaMessageNamespace
} from './common'
import * as ASHError from './error'
import * as Profile from '../profile'
import { copyElement } from './copy'

export interface AlexaRequestDirectivePayload {
  scope?: {
    type: 'BearerToken';
    token: string;
  };
  grant?: {
    type: 'OAuth2.AuthorizationCode';
    code: string;
  };
  grantee?: {
    type: 'BearerToken';
    token: string;
  }
  [x: string]: boolean | number | string | [] | object | undefined;
};

export interface AlexaRequestDirective {
  header: AlexaMessageHeader;
  endpoint?: AlexaMessageEndpoint;
  payload: AlexaRequestDirectivePayload;
  [x: string]: object | undefined;
}

export class AlexaRequest {
  public directive: AlexaRequestDirective;
  [x: string]: object | undefined;
  public constructor (opts: {
    directive: {
      header: {
        namespace?: AlexaMessageNamespace;
        name?: string;
        instance?: string;
        messageId?: string;
        correlationToken?: string;
        payloadVersion?: '3';
      };
      endpoint?: object;
      payload: AlexaRequestDirectivePayload;
    };
  }) {
    this.directive = (copyElement(opts.directive) as AlexaRequestDirective)
  }

  public getCorrelationToken (): string | undefined {
    return this.directive.header.correlationToken
  }

  public getEndpointId (): string | undefined {
    return this.directive.endpoint?.endpointId
  }

  public getBearerToken (): string {
    if (typeof this.directive.endpoint?.scope?.token !== 'undefined') {
      return this.directive.endpoint.scope.token
    }
    if (typeof this.directive.payload?.scope?.token !== 'undefined') {
      return this.directive.payload.scope.token
    }
    if (typeof this.directive.payload?.grantee?.token !== 'undefined') {
      return this.directive.payload.grantee.token
    }
    throw ASHError.errorResponse(this, 400, 'INVALID_DIRECTIVE', 'Bearer Token not found.')
  }

  public async getUserProfile (): Promise<{ user_id: string; email: string; [x: string]: string}> {
    const bearerToken = this.getBearerToken()
    try {
      return await Profile.getUserProfile(bearerToken)
    } catch (error) {
      if (error instanceof ASHError.AlexaError) {
        const endpointId = this.getEndpointId()
        if (typeof endpointId !== 'undefined') {
          error.response.setEndpointId(endpointId)
        }
        throw error
      } else {
        throw ASHError.errorResponseFromError(this, error)
      }
    }
  }

  public async getUserEmail (): Promise<string | null> {
    const userProfile = await this.getUserProfile()
    return userProfile.email
  }
}
