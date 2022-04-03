import {
  Endpoint,
  Header,
  Namespace
} from './common'
import { copyElement } from './copy'

export interface RequestDirectivePayload {
  [x: string]: boolean | number | string | [] | object;
}

export interface Directive {
  header: Header;
  endpoint?: Endpoint;
  payload: RequestDirectivePayload;
  [x: string]: object | undefined;
}

export class Request {
  public directive: Directive;
  [x: string]: object | undefined;
  public constructor (opts: {
    directive: {
      header: {
        namespace?: Namespace;
        name?: string;
        instance?: string;
        messageId?: string;
        correlationToken?: string;
        payloadVersion?: '3';
      };
      endpoint?: object;
      payload: RequestDirectivePayload;
    };
  }) {
    if (!(typeof opts.directive === 'object')) {
      throw new TypeError('\'opts.direct\' must be type \'object\'')
    }
    if (!(typeof opts.directive.header === 'object')) {
      throw new TypeError('\'opts.directive.header\' must be type \'object\'')
    }
    if (!(typeof opts.directive.header.namespace === 'string')) {
      throw new TypeError('\'opts.directive.header.namespace\' must be type \'string\'')
    }
    if (!(typeof opts.directive.header.name === 'string')) {
      throw new TypeError('\'opts.directive.header.name\' must be type \'string\'')
    }
    if (!(typeof opts.directive.header.instance === 'string' ||
            typeof opts.directive.header.instance === 'undefined')) {
      throw new TypeError('\'opts.directive.header.instance\' must be type \'string\'')
    }
    if (!(typeof opts.directive.header.messageId === 'string')) {
      throw new TypeError('\'opts.directive.header.messageId\' must be type \'string\'')
    }
    if (!(typeof opts.directive.header.correlationToken === 'string' ||
            typeof opts.directive.header.correlationToken === 'undefined')) {
      throw new TypeError('\'opts.directive.header.correlationToken\' must be type \'string\' when set')
    }
    if (!(typeof opts.directive.header.payloadVersion === 'string')) {
      throw new TypeError('\'opts.directive.header.payloadVersion\' must be type \'string\'')
    }
    if (!(opts.directive.header.payloadVersion === '3')) {
      throw new RangeError('\'opts.directive.header.payloadVersion\' must be a \'string\' of \'3\'.')
    }
    if (!(typeof opts.directive.endpoint === 'object' ||
            typeof opts.directive.endpoint === 'undefined')) {
      throw new TypeError('\'opts.directive.endpoint\' requires type \'object\' when set')
    }
    if (!(typeof opts.directive.payload === 'object')) {
      throw new TypeError('\'opts.directive.payload\' requires type \'object\'')
    }

    this.directive = (copyElement(opts.directive) as Directive)
  }

  public getCorrelationToken (): string | undefined {
    return this.directive.header.correlationToken
  }

  public getEndpointId (): string | undefined {
    return this.directive.endpoint && this.directive.endpoint.endpointId
  }
}
