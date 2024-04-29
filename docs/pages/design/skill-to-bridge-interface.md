# The Skill to Bridge Interface

The skill and the bridge communicate over HTTP with the skill in the role of HTTP client and the bridge in the role of HTTP server. Access is controlled using tokens carried in the HTTP request Authorization header.

The bridge presents the skill with three interfaces: the login interface, the test interface and the service interface(s). The login interface allows the skill to request and be granted access to a service provided by the bridge. The test interface allows a skill to test whether or not it has access to the bridge. The service interface performs services on behalf of a skill. For example, the current implementation has a service interface that allows the skill to forward Smart Home Skill Directives to the bridge for handling.

While alexa-for-lg-webos-tv has a specific function, the skill to bridge interface is designed to be generic. It's login and test interfaces are independent of the services supported, and it can support multiple services simultaneously.

- [The Reverse Proxy](#the-reverse-proxy)
- [Interface Authorization](#interface-authorization)
  - [The Login Token](#the-login-token)
  - [The Bridge Token](#the-bridge-token)
- [The Login Interface](#the-login-interface)
  - [The Login Interface Message Flow](#the-login-interface-message-flow)
  - [The Login Interface Message Formats](#the-login-interface-message-formats)
- [The Test Interface](#the-test-interface)
  - [The Test Interface Message Flow](#the-test-interface-message-flow)
  - [The Test Interface Message Formats](#the-test-interface-message-formats)
- [The Service Interface](#the-service-interface)
  - [The Service Interface Message Flow](#the-service-interface-message-flow)
  - [The Service Interface Message Formats](#the-service-interface-message-formats)

## The Reverse Proxy

[As mentioned above](#the-skill-to-bridge-interface), the interfaces run over HTTP and interface access is controlled using tokens carried in the HTTP request Authorization header. For the tokens to be effective at controlling access to the APIs, the transport carrying HTTP must be protected against eavesdropping and tampering. Therefore, the skill implementation requires the transport be HTTPS using a certificate issued by a certificate authority trusted by the Amazon cloud.

However, the bridge only supports HTTP. It doesn't support HTTPS. If your home network is like mine, then you have a server that's responsible for renewing [Let's Encrypt](https://letsencrypt.org) issued SSL/TLS certificates as well as acting as a reverse proxy for internal web pages/services that must be accessed from the internet. Doing this has many advantages, including simplifying SSL/TLS certificate management and simplifying web service implementations. The bridge implementation assumes it will be deployed on such a network behind a reverse proxy.

## Interface Authorization

The bridge consumes resources. Therefore, even though the services supported by the bridge may have protections against misuse, the bridge needs its own protections against misuse.

[As mentioned above](#the-skill-to-bridge-interface), interface access is controlled using tokens carried in the HTTP request Authorization header. The token is bound to a user and a service. The token enables the bridge to verify that message is from a trusted skill and that the message is being sent on behalf of a user who has been authorized to use the service.

When the bridge receives a message on any skill to bridge interface, it verifies the token. If token verification fails, then the bridge rejects the message. After some number of repeated token verification failures originating from the same IP address, the bridge may (temporarily) block the IP address.

There are two types of tokens: the login token and the bridge token. The skill uses a login token when accessing the login interface. The skill uses a bridge token when accessing a service interface as well as the test interface. The skill uses the login interface to "exchange" a login token for a bridge token. Login tokens are exchanged for bridge tokens because bridge tokens are less expensive to transmit and verify.

### The Login Token

The skill uses a login token (referred to as LOGIN_TOKEN or loginToken) to request access on behalf of a user to a service provided by the bridge. It generates the login token. It uses the login token when accessing the login interface to request access to a service interface on behalf of a user.

#### The Login Token Format

The login token is a JSON Web Token (JWT) with the form

```json
{
    "iss": "For LG webOS TV",
    "sub": "USER_EMAIL",
    "aud": "https://BRIDGE_HOSTNAME/api/ForLGwebOSTV/v1",
    "exp": "NOW + 1m"
}
```

The login token's `"iss"` field identifies the skill. In the skill implementation and the bridge implementation, it is set by `constants.jwt.iss` in [src/common/constants.ts](../../src/common/constants.ts) and is currently set to

```text
"For LG webOS TV"
```

The login token's `"sub"` field identifies the user. In the skill implementation, it is set to be the email address provided by account linking. In the bridge implementation, it is assumed to be the email address provided by account linking.

The login token's `"aud"` field identifies the service. It's a URL that identifies the service. BRIDGE_HOSTNAME is the bridge's DNS name. In the skill implementation, BRIDGE_HOSTNAME is set using the Custom Skill. In the skill implementation and the bridge implementation, the path is set by `constants.bridge.path.skill` in [src/common/constants.ts](../../src/common/constants.ts) and is currently set to

```text
/api/ForLGwebOSTV/v1
```

The login token's `"exp"` field specifies when the login token will expire. It's recommended that the login token have a short lifetime in order to reduce the chance of replay. In the skill implementation, the login token is set to expire one minute after it was generated.

#### The Login Token Authorization

The bridge verifies that the login came from a trusted skill. It does this by verifying that the login token was signed using a private key belonging to the skill. If verification fails, then login token authorization fails.

The bridge verifies that the login token has not expired. If verification fails, then the login token authorization fails.

The bridge verifies that the skill identified by the login token is allowed to access the service identified in the login token on behalf of the user identified in the login token. If verification fails, then the login token authorization fails.

### The Bridge Token

The bridge uses the bridge token to grant access to a service interface. The skill can request a bridge token using the login interface. The returned bridge token is bound to the user and service from the login token.

The indirect bridge token rather than the direct login token is used to access the service interfaces because the bridge token is less expensive to transmit and verify.

#### The Bridge Token Format

The bridge token can be any base64 string. As it is assigned by the bridge and simply reflected by the skill, it's up to the bridge to ensure that it assigns the skill a bridge token that it can later validate.

#### The Bridge Token Authorization

For the test interface, the bridge verifies that the bridge token belongs to an authorized user of a service on the bridge. For the service interface, the bridge verifies that the bridge token belongs to an authorized user of the service. If verification fails, then bridge token authorization fails.

## The Login Interface

The skill uses the login interface to request a bridge token that the skill can use to access a service interface on behalf of a user. The skill requests access by sending a `Login Request` authorized by a login token.

Assuming the login token authorizes, the bridge assigns a bridge token granting the user from the login token access to the service requested in login token, and sends a `Login  Response` message containing the assigned bridge token. Otherwise, it sends an `Auth Failure Response` message. If there is an error, then it sends an `Error Response` message.

Only the most recent bridge token issued for granting a specific user access to a specific service is valid. In addition to granting access to the service's interface, the bridge token grants access to the test interface.

### The Login Interface Message Flow

```mermaid
sequenceDiagram
  box skill
    participant skill_shs as SHS
    participant skill_cs as CS
    participant skill_link as link
  end
  participant proxy as reverse proxy
  box bridge
    participant bridge_link as link
    participant bridge_service as service
  end

  skill_link->>proxy: "Login Request" over HTTPS
  proxy->>bridge_link: "Login Request" over HTTP
  note right of bridge_link: authorize login token
  alt is Authorization Succeeded
    note right of bridge_link: assign bridge token
    bridge_link->>proxy: "Login Response" over HTTP
    proxy->>skill_link: "Login Response" over HTTPS
  else is Authorization Failed
    bridge_link->>proxy: "Auth Failure Response" over HTTP
    proxy->>skill_link: "Auth Failure Response" over HTTPS
  else is Error Occurred
    bridge_link->>proxy: "Error Response" over HTTP
    proxy->>skill_link: "Error Response" over HTTPS
  end
```

### The Login Interface Message Formats

The `Login Request` message is the HTTP request header:

```http
GET /login
Host: BRIDGE_HOSTNAME
Authentication: Bearer LOGIN_TOKEN
```

The `Login Response` message is the HTTP response header and body

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
    token: BRIDGE_TOKEN
}
```

The `Auth Failure Response` message is the HTTP response header and body

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
```

```json
{}
```

The `Error Response` message is the HTTP response header and body

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json
```

```json
{}
```

## The Test interface

The skill uses the test interface to test that a bridge token is valid. The skill sends a `Test Request` message authorized by a bridge token.

Assuming the bridge token is valid, the bridge sends a `Test Response` message. Otherwise, it sends an `Auth Failure Response` message. If there is an error, then it sends an `Error Response` message.

This interface allows a skill to discover that a bridge token is valid on the bridge. It does not allow the skill to discover the user or the service for which the bridge token is valid.

### The Test Interface Message Flow

```mermaid
sequenceDiagram
  box skill
    participant skill_shs as SHS
    participant skill_cs as CS
    participant skill_link as link
  end
  participant proxy as reverse proxy
  box bridge
    participant bridge_link as link
    participant bridge_service as service
  end

  skill_link->>proxy: "Test Request" over HTTPS
  proxy->>bridge_link: "Test Request" over HTTP
  note right of bridge_link: authorize bridge token
  alt is Authorization Succeeded
    bridge_link->>proxy: "Test Response" over HTTP
    proxy->>skill_link: "Test Response" over HTTPS
  else is Authorization Failed
    bridge_link->>proxy: "Auth Failure Response" over HTTP
    proxy->>skill_link: "Auth Failure Response" over HTTPS
  else is Error Occurred
    bridge_link->>proxy: "Error Response" over HTTP
    proxy->>skill_link: "Error Response" over HTTPS
  end
```

### The Test Interface Message Formats

The `Test Request` message is the HTTP request header

```http
GET /test
Host: BRIDGE_HOSTNAME
Authentication: Bearer BRIDGE_TOKEN
```

The `Test Response` message is the HTTP response header and body

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{}
```

For the `Auth Failure Response` message is the HTTP response header and body

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
```

```json
{}
```

The `Error Response` message is the HTTP response header and body

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json
```

```json
{}
```

## The Service Interface

The skill uses the service interface to interact with the LG webOS TVs. The skill sends a `Service Request` message authorized by a bridge token and containing a Smart Home Skill Directive (SMART_HOME_SKILL_DIRECTIVE).

Assuming the bridge token is valid, the bridge fulfills the Directive and sends a `Service Response` message containing the resulting Smart Home Skill Synchronous Response (SMART_HOME_SKILL_SYNCHRONOUS_RESPONSE). Otherwise, it sends an `Auth Failure Response` message. If there is an error, then it sends an `Error Response` message.

The service interface only accepts Directives for the user authorized to use the service interface. The bridge checks whether or not the user associated with the bearer token in the Directive is the same as the user associated with the bridge token used to access the service interface. If they are not the same, then the Directive is responded to with an `Alexa ErrorResponse` specifying `INVALID_AUTHORIZATION_CREDENTIAL`.

### The Service Interface Message Flow

```mermaid
sequenceDiagram
  box skill
    participant skill_shs as SHS
    participant skill_cs as CS
    participant skill_link as link
  end
  participant proxy as reverse proxy
  box bridge
    participant bridge_link as link
    participant bridge_service as service
  end

  skill_shs->>skill_link: "SHS Directive"
  skill_link->>proxy: "Service Request" over HTTPS
  proxy->>bridge_link: "Service Request" over HTTP
  note right of bridge_link: authorize bridge token
  alt is Authorization Succeeded
    bridge_link->>bridge_service: "SHS Directive"
    note right of bridge_service: act on SHS Directive
    note right of bridge_service: generate SHS Synchronous Response
    bridge_service->>bridge_link: "SHS Synchronous Response"
    bridge_link->>proxy: "Service Response" over HTTP
    proxy->>skill_link: "Service Response" over HTTPS
    skill_link->>skill_shs: "Service Response"
  else is Authorization Failed
    bridge_link->>proxy: "Auth Failure Response" over HTTP
    proxy->>skill_link: "Auth Failure Response" over HTTPS
    skill_link->>skill_shs: "Auth Failure Response"
  else is Error Occurred
    bridge_link->>proxy: "Error Response" over HTTP
    proxy->>skill_link: "Error Response" over HTTPS
    skill_link->>skill_shs: "Error Response"
  end
```

### The Service Interface Message Formats

The `Service Request` message is the HTTP request header and body

```http
POST /api/ForLGwebOSTV/v1
Host: BRIDGE_HOSTNAME
Authentication: Bearer BRIDGE_TOKEN
Content-Type: application/json
```

```text
SMART_HOME_SKILL_DIRECTIVE
```

The `Service Response` message is the HTTP response header and body

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```text
SMART_HOME_SKILL_SYNCHRONOUS_RESPONSE
```

The `Auth Failure Response` message is the HTTP response header and body

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
```

```json
{}
```

The `Error Response` message is the HTTP response header and body

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json
```

```json
{}
```
