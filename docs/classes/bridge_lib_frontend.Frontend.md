[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/frontend](../modules/bridge_lib_frontend.md) / Frontend

# Class: Frontend

[bridge/lib/frontend](../modules/bridge_lib_frontend.md).Frontend

The Frontend class handles the communication link between the bridge and the
skill. It is an HTTP server that maintains three URL path-differentiated
communication links:

- an authorization link
  - for skill and email address authorization, and
  - identified by the URL path given in the constant
    [Common.constants.bridge.path.login](../modules/common_constants.md#login)),
- a test link
  - for testing whether or not the skill and email address are currently
    authorized,
  - identified by the URL path given in the constant
    [Common.constants.bridge.path.test](../modules/common_constants.md#test)), and
- a skill link
  - for sending/receiving Alexa Smart Home Skill messages, and
  - identified by the URL path given in the constant
    [Common.constants.bridge.path.skill](../modules/common_constants.md#skill)).

The frontend uses a bearer token to authorize HTTP messages sent on the test
link and the skill link.

The frontend uses the authorization link to authorize the skill and the email
address and to establish the bearer token used to authorize HTTP messages
sent on the test link and the skill link. The skill sends a JWT (see
[RFC7519](https://datatracker.ietf.org/doc/html/rfc7519)) containing
the bridge hostname and the email address and signed by the skill. The bridge
verifies the JWT, checks that the email address is authorized and creates the
bearer token. TODO: verify that the bridge hostname in the JWT matches the
bridge's hostname.

## Table of contents

### Constructors

- [constructor](bridge_lib_frontend.Frontend.md#constructor)

### Properties

- [\_ajv](bridge_lib_frontend.Frontend.md#_ajv)
- [\_authorization](bridge_lib_frontend.Frontend.md#_authorization)
- [\_ipBlacklist](bridge_lib_frontend.Frontend.md#_ipblacklist)
- [\_middle](bridge_lib_frontend.Frontend.md#_middle)
- [\_schemaValidator](bridge_lib_frontend.Frontend.md#_schemavalidator)
- [\_server](bridge_lib_frontend.Frontend.md#_server)

### Methods

- [start](bridge_lib_frontend.Frontend.md#start)
- [build](bridge_lib_frontend.Frontend.md#build)

## Constructors

### constructor

• **new Frontend**(`_authorization`, `_middle`, `_ipBlacklist`, `_ajv`, `_schemaValidator`, `_server`): [`Frontend`](bridge_lib_frontend.Frontend.md)

The constructor is private. To instantiate a Frontend, use [Frontend.build](bridge_lib_frontend.Frontend.md#build)().

#### Parameters

| Name | Type |
| :------ | :------ |
| `_authorization` | [`Authorization`](bridge_lib_frontend_authorization.Authorization.md) |
| `_middle` | [`Middle`](bridge_lib_middle.Middle.md) |
| `_ipBlacklist` | `any` |
| `_ajv` | `Ajv2019` |
| `_schemaValidator` | `ValidateFunction`\<`unknown`\> |
| `_server` | `Express` |

#### Returns

[`Frontend`](bridge_lib_frontend.Frontend.md)

## Properties

### \_ajv

• `Private` `Readonly` **\_ajv**: `Ajv2019`

___

### \_authorization

• `Private` `Readonly` **\_authorization**: [`Authorization`](bridge_lib_frontend_authorization.Authorization.md)

___

### \_ipBlacklist

• `Private` `Readonly` **\_ipBlacklist**: `any`

___

### \_middle

• `Private` `Readonly` **\_middle**: [`Middle`](bridge_lib_middle.Middle.md)

___

### \_schemaValidator

• `Private` `Readonly` **\_schemaValidator**: `ValidateFunction`\<`unknown`\>

___

### \_server

• `Private` `Readonly` **\_server**: `Express`

## Methods

### start

▸ **start**(): `void`

#### Returns

`void`

___

### build

▸ **build**(`configuration`, `middle`): `Promise`\<[`Frontend`](bridge_lib_frontend.Frontend.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `middle` | [`Middle`](bridge_lib_middle.Middle.md) |

#### Returns

`Promise`\<[`Frontend`](bridge_lib_frontend.Frontend.md)\>
