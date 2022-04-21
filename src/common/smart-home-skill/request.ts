import { SHSError } from './error'
import * as Profile from '../profile/smart-home-skill'
import { copyElement } from './copy'

export namespace SHSDirective {
    export namespace Header {
      export type Namespace =
      'Alexa' |
      'Alexa.Authorization' |
      'Alexa.Discovery' |
      'Alexa.ChannelController' |
      'Alexa.InputController' |
      'Alexa.Launcher' |
      'Alexa.PlaybackController' |
      'Alexa.PowerController' |
      'Alexa.Speaker'
    }
    export interface Header {
      namespace: Header.Namespace;
      name: string;
      instance?: string;
      messageId: string;
      correlationToken?: string;
      payloadVersion: '3';
      [x: string]: string | undefined;
    }
    export interface Endpoint {
      endpointId: string;
      scope?: {
        type: 'BearerToken';
        token: string;
        [x: string]: string;
      };
      cookie?: {[x: string]: string};
      [x: string]: string | object | undefined;
    }
    export interface Payload {
      scope?: {
        type: 'BearerToken'
        token: string
      }
      grant?: {
        type: 'OAuth2.AuthorizationCode'
        code: string
      }
      grantee?: {
        type: 'BearerToken'
        token: string
      }
      [x: string]: boolean | number | string | [] | object | undefined
    }
  }
export interface SHSDirective {
    header: SHSDirective.Header
    endpoint?: SHSDirective.Endpoint
    payload: SHSDirective.Payload
    [x: string]: object | undefined
  }

export class SHSRequest {
  public directive: SHSDirective
  [x: string]: object | undefined;
  public constructor (opts: {
    directive: {
      header: {
        namespace?: SHSDirective.Header.Namespace;
        name?: string;
        instance?: string;
        messageId?: string;
        correlationToken?: string;
        payloadVersion?: '3';
      };
      endpoint?: object;
      payload: SHSDirective.Payload;
    };
  }) {
    this.directive = (copyElement(opts.directive) as SHSDirective)
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
    throw SHSError.errorResponse(this, 400, 'INVALID_DIRECTIVE', 'Bearer Token not found.')
  }

  public async getUserProfile (): Promise<{ user_id: string; email: string; [x: string]: string}> {
    const bearerToken = this.getBearerToken()
    try {
      return await Profile.getUserProfile(bearerToken)
    } catch (error) {
      if (error instanceof SHSError) {
        const endpointId = this.getEndpointId()
        if (typeof endpointId !== 'undefined') {
          error.response.setEndpointId(endpointId)
        }
        throw error
      } else {
        throw SHSError.errorResponseFromError(this, error)
      }
    }
  }

  public async getUserEmail (): Promise<string> {
    const userProfile = await this.getUserProfile()
    return userProfile.email
  }
}
