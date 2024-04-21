[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/frontend](../modules/bridge_lib_frontend.md) / Frontend

# Class: Frontend

[bridge/lib/frontend](../modules/bridge_lib_frontend.md).Frontend

The frontend handles the communication link between the bridge and the skill.
It is an HTTP server that maintains three path-differentiated communication
links: an authorization link for skill and email address authorization, a
test link for testing whether or not the skill and email address are
currently authorized and a Alexa Smart Home Skill link for sending Alexa
Smart Home Skill messages.

The frontend uses a bearer token to authorize HTTP messages sent on the test
link and the Alexa Smart Home Skill link.

The frontend uses the authorization link to authorize the skill and the email
address and to establish the bearer token. The skill sends a JWT containing
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