[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/frontend](../README.md) / Frontend

# Class: Frontend

## Constructors

### new Frontend()

> `private` **new Frontend**(`_loginTokenAuth`, `_bridgeTokenAuth`, `_middle`, `_ipBlacklist`, `_ajv`, `_schemaValidator`, `_server`): [`Frontend`](Frontend.md)

The constructor is private. To instantiate a Frontend, use [Frontend.build](Frontend.md#build)().

#### Parameters

• **\_loginTokenAuth**: [`LoginTokenAuth`](../login-token-auth/classes/LoginTokenAuth.md)

• **\_bridgeTokenAuth**: [`BridgeTokenAuth`](../bridge-token-auth/classes/BridgeTokenAuth.md)

• **\_middle**: [`Middle`](../../middle/classes/Middle.md)

• **\_ipBlacklist**: [`default`](../../../types/@outofsync/express-ip-blacklist/classes/default.md)

• **\_ajv**: `Ajv2019`

• **\_schemaValidator**: `ValidateFunction`\<`unknown`\>

• **\_server**: `Express`

#### Returns

[`Frontend`](Frontend.md)

## Properties

### \_ajv

> `private` `readonly` **\_ajv**: `Ajv2019`

***

### \_bridgeTokenAuth

> `private` `readonly` **\_bridgeTokenAuth**: [`BridgeTokenAuth`](../bridge-token-auth/classes/BridgeTokenAuth.md)

***

### \_ipBlacklist

> `private` `readonly` **\_ipBlacklist**: [`default`](../../../types/@outofsync/express-ip-blacklist/classes/default.md)

***

### \_loginTokenAuth

> `private` `readonly` **\_loginTokenAuth**: [`LoginTokenAuth`](../login-token-auth/classes/LoginTokenAuth.md)

***

### \_middle

> `private` `readonly` **\_middle**: [`Middle`](../../middle/classes/Middle.md)

***

### \_schemaValidator

> `private` `readonly` **\_schemaValidator**: `ValidateFunction`\<`unknown`\>

***

### \_server

> `private` `readonly` **\_server**: `Express`

## Methods

### start()

> **start**(): `void`

#### Returns

`void`

***

### build()

> `static` **build**(`configuration`, `middle`): `Promise`\<[`Frontend`](Frontend.md)\>

#### Parameters

• **configuration**: [`Configuration`](../../configuration/classes/Configuration.md)

• **middle**: [`Middle`](../../middle/classes/Middle.md)

#### Returns

`Promise`\<[`Frontend`](Frontend.md)\>
