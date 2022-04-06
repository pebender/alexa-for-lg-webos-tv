import * as ASH from '../../common/alexa'
import { constants } from '../../common/constants'
import http from 'http'
import https from 'https'

export interface BridgeRequest {
  [x: string]: number | string | object | undefined;
}

export interface BridgeResponse {
  error?: {
    name?: string;
    message?: string;
  };
  [x: string]: number | string | object | undefined;
}

function createBasicOptions (requestOptions: {
  hostname: string;
  username: string;
  password: string;
  path: string;
  rejectUnauthorized?: boolean;
}): {
    hostname: string;
    port: number;
    path: string;
    headers: {
      [x: string]: string;
    };
    rejectUnauthorized: boolean;
} {
  if (typeof requestOptions.hostname === 'undefined' || requestOptions.hostname === null) {
    throw new RangeError('Bridge hostname not set.')
  }
  if (typeof requestOptions.username === 'undefined' || requestOptions.username === null) {
    throw new RangeError('Bridge username not set.')
  }
  if (typeof requestOptions.password === 'undefined' || requestOptions.password === null) {
    throw new RangeError('Bridge password not set.')
  }
  if (typeof requestOptions.path === 'undefined' || requestOptions.path === null) {
    throw new RangeError('Bridge path not set.')
  }

  const authorization = Buffer.from(`${requestOptions.username}:${requestOptions.password}`).toString('base64')
  const options = {
    hostname: requestOptions.hostname,
    port: 25392,
    path: requestOptions.path,
    headers: {
      authorization: `Basic ${authorization}`
    },
    rejectUnauthorized:
            typeof requestOptions.rejectUnauthorized !== 'undefined'
              ? requestOptions.rejectUnauthorized
              : true
  }
  return options
}

function pingHandler (requestOptions: {
  hostname: string;
  username: string;
  password: string;
  path: string;
  rejectUnauthorized?: boolean;
}): Promise<boolean> {
  return new Promise((resolve, reject): void => {
    let options: {
      hostname: string;
      port: number;
      path: string;
      headers: {
        [x: string]: string;
      };
      rejectUnauthorized: boolean;
    } | null = null
    try {
      options = createBasicOptions(requestOptions)
    } catch (error) {
      reject(error)
      return
    }
    const request = https.get(options)
    request.once('response', (response): void => {
      response.setEncoding('utf8')
      response.on('data', (chunk: string): void => {
        // eslint-disable-next-line no-unused-vars
        const _nothing: string = chunk
      })
      response.on('end', (): void => {
        if (response.statusCode === 200) {
          resolve(true)
        }
        if (typeof response.statusCode !== 'undefined') {
          if (typeof http.STATUS_CODES[response.statusCode] !== 'undefined') {
            const error = new Error()
            error.name = 'HTTP_SERVER_ERROR'
            error.message = 'The bridge returned HTTP/1.1 status ' +
                          ` '${http.STATUS_CODES[response.statusCode]} (${response.statusCode})'.`
            reject(error)
          }
          const error = new Error()
          error.name = 'HTTP_SERVER_ERROR'
          error.message = 'The bridge returned HTTP/1.1 status ' +
                      ` '${response.statusCode}'.`
          reject(error)
        } else {
          const error = new Error()
          error.name = 'HTTP_SERVER_ERROR'
          error.message = 'The bridge returned no HTTP/1.1 status.'
          reject(error)
        }
      })
      response.on('error', (error: Error): void => reject(error))
    })
    request.on('error', (error: Error): void => reject(error))
  })
}

function sendHandler (requestOptions: {
  hostname: string;
  username: string;
  password: string;
  path: string;
  rejectUnauthorized?: boolean;
}, requestBody: BridgeRequest): Promise<BridgeResponse> {
  return new Promise((resolve, reject): void => {
    const options: {
      method?: 'POST';
      hostname: string;
      port: number;
      path: string;
      headers: {
        [x: string]: string;
      };
      rejectUnauthorized: boolean;
    } = createBasicOptions(requestOptions)
    const content = JSON.stringify(requestBody)
    options.method = 'POST'
    options.headers['content-type'] = 'application/json'
    options.headers['content-length'] = Buffer.byteLength(content).toString()
    const request = https.request(options)
    request.once('response', (response): void => {
      let body: BridgeResponse = {}
      let data = ''
      response.setEncoding('utf8')
      response.on('data', (chunk: string): void => {
        data += chunk
      })
      console.log(data)
      response.on('end', (): void => {
        // The expected HTTP/1.1 status code is 200.
        const statusCode = response.statusCode
        if (typeof statusCode === 'undefined') {
          const message = 'The bridge returned no HTTP/1.1 status code.'
          console.log(message)
          return reject(new Error(message))
        }
        if (statusCode !== 200) {
          if (typeof http.STATUS_CODES[statusCode] === 'undefined') {
            const message = 'The bridge returned HTTP/1.1 status code: ' +
                            `'${statusCode}'.`
            console.log(message)
            return reject(new Error(message))
          } else {
            const message = 'The bridge returned HTTP/1.1 status code: ' +
                            `'${statusCode}' ('${http.STATUS_CODES[statusCode]}').`
            console.log(message)
            return reject(new Error(message))
          }
        }
        // The expected HTTP/1.1 'content-type' header is 'application/json'
        const contentType = response.headers['content-type']
        if (typeof contentType === 'undefined') {
          const message = 'The bridge returned no \'content-type\' header.'
          console.log(message)
          return reject(new Error(message))
        }
        if (!(/^application\/json/).test(contentType.toLowerCase())) {
          const message = 'The bridge returned the wrong \'content-type\' header:' +
                          `'${contentType.toLowerCase()}'.`
          console.log(message)
          return reject(new Error(message))
        }
        // Validate the body.
        try {
          body = JSON.parse(data)
        } catch (error) {
          const message = 'The bridge returned invalid JSON in its body.'
          return reject(new Error(message))
        }
        if (typeof body.error !== 'undefined') {
          if (typeof body.error.name !== 'undefined') {
            const message = 'The bridge returned the error: ' +
                            `'${body.error.name}: ${body.error.message}'.`
            console.log(message)
            return reject(new Error(message))
          } else {
            const message = 'The bridge returned the error: ' +
                            `'${body.error.message}'.`
            console.log(message)
            return reject(new Error(message))
          }
        }
        // Return the body.
        return resolve(body)
      })
      response.on('error', (error: Error): void => {
        const message = 'There was a problem talking to the bridge. ' +
                        `The error was [${error.toString()}].`
        console.log(message)
        return reject(new Error(message))
      })
    })
    request.on('error', (error: Error): void => {
      const message = 'There was a problem talking to the bridge.' +
                      `The error was [${error.name}: ${error.message}].`
      console.log(message)
      return reject(new Error(message))
    })
    request.write(content)
    request.end()
  })
}

class Bridge {
  private _userId: string
  private _hostname: string
  private _username: string
  private _password: string
  private _null: string
  public constructor (userId: string) {
    this._userId = userId
    // These will be in a database indexed by userId.
    this._hostname = constants.bridgeHostname
    this._username = 'LGTV'
    this._password = constants.bridgeUserPassword
    this._null = ''
  }

  public static skillPath (): string {
    return '/LGTV/SKILL'
  }

  public set hostname (hostname: string) {
    this._null = hostname
  }

  public get hostname (): string {
    return this._hostname
  }

  public set password (password: string) {
    this._null = password
  }

  public get password (): string {
    return this._password
  }

  public get username (): string {
    return this._username
  }

  public async sendSkillDirective (request: ASH.Request): Promise<ASH.Response> {
    const options = {
      hostname: this.hostname,
      username: this.username,
      password: this.password,
      path: '/LGTV/SKILL'
    }
    try {
      const response = ((await sendHandler(options, request)) as ASH.Response)
      const alexaResponse = new ASH.Response(response)
      return alexaResponse
    } catch (error) {
      if (error instanceof Error) {
        return ASH.errorResponseFromError(request, error)
      } else {
        return ASH.errorResponse(request, 'Unknown', 'Unknown')
      }
    }
  }

  public send (
    sendOptions: {
      hostname?: string;
      username?: string;
      password?: string;
      path: string;
    },
    request: BridgeRequest
  ): Promise<BridgeResponse> {
    const options = {
      hostname: typeof sendOptions.hostname !== 'undefined'
        ? sendOptions.hostname
        : this.hostname,
      username: typeof sendOptions.username !== 'undefined'
        ? sendOptions.username
        : this.username,
      password: typeof sendOptions.password !== 'undefined'
        ? sendOptions.password
        : this.password,
      path: sendOptions.path
    }
    return sendHandler(options, request)
  }

  public ping (): Promise<boolean> {
    const options = {
      hostname: this.hostname,
      username: this.username,
      password: this.password,
      path: Bridge.skillPath()
    }
    return pingHandler(options)
  }
}

export { Bridge }
