import {
  Endpoint,
  Header,
  Namespace
} from './common'
import { copyElement } from './copy'
import https from 'https'

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

  public getBearerToken (): string | null {
    switch (this.directive.header.namespace) {
      case 'Alexa.Discovery': {
        const payload = (this.directive.payload as any)
        if ((typeof payload.scope.type === 'undefined') ||
            (typeof payload.scope.token === 'undefined')) {
          console.log('getBearerToken: Alexa.Discovery: this.directive.payload.scope is missing')
          return null
        }
        if (payload.scope.type !== 'BearerToken') {
          console.log('getBearerToken: Alexa.Discovery: this.directive.payload.scope.type is no BearerToken')
          return null
        }
        return (payload.scope.token as string)
      }
      case 'Alexa.Authorization': {
        const payload = (this.directive.payload as any)
        if ((typeof payload.grantee.type === 'undefined') ||
            (typeof payload.grantee.token === 'undefined')) {
          console.log('getBearerToken: Alexa.Authorization: this.directive.payload.scope is missing')
          return null
        }
        if (payload.grantee.type !== 'BearerToken') {
          console.log('getBearerToken: Alexa.Authorization: this.directive.payload.scope.type is no BearerToken')
          return null
        }
        return (payload.grantee.token as string)
      }
      default: {
        const endpoint = (this.directive.endpoint as any)
        if ((typeof endpoint.scope.type === 'undefined') ||
            (typeof endpoint.scope.token === 'undefined')) {
          console.log('getBearerToken: Alexa.*: this.directive.endpoint.scope is missing')
          return null
        }
        if (endpoint.scope.type !== 'BearerToken') {
          console.log('getBearerToken: Alexa.*: this.directive.payload.scope.type is no BearerToken')
          return null
        }
        return (endpoint.scope.token as string)
      }
    }
  }

  public getCorrelationToken (): string | undefined {
    return this.directive.header.correlationToken
  }

  public getEndpointId (): string | undefined {
    return this.directive.endpoint && this.directive.endpoint.endpointId
  }

  public async getUserProfile (): Promise<any> {
    const bearerToken = this.getBearerToken()
    if (bearerToken === null) {
      console.log('getUserProfile: bearerToken is null')
    }

    try {
      return await new Promise((resolve, reject) => {
        const options = {
          method: 'GET',
          hostname: 'api.amazon.com',
          path: '/user/profile',
          headers: {
            Authorization: `Bearer ${bearerToken}`
          }
        }
        const req = https.request(options, (response) => {
          let returnData = ''

          response.on('data', (chunk) => {
            returnData += chunk
          })

          response.on('end', () => {
            resolve(JSON.parse(returnData))
          })

          response.on('error', (error) => {
            console.log(`getUserProfile: HTTPS response: ${JSON.stringify(error)}`)
            reject(error)
          })
        })
        req.end()
      })
    } catch (error) {
      console.log(`getUserProfile: ${JSON.stringify(error)}`)
      console.log(JSON.stringify(error))
    }
  }

  public async getUserEmail (): Promise<string | null> {
    try {
      const userProfile = await this.getUserProfile()
      if (typeof userProfile === 'undefined') {
        console.log('getUserEmail: userProfile is getUserProfile returned undefined')
        return null
      }
      return (userProfile.email as string)
    } catch (error) {
      console.log(`getUserEmail: ${JSON.stringify(error)}`)
      return null
    }
  }
}
