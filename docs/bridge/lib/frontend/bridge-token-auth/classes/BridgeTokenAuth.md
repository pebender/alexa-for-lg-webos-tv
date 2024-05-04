[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/frontend/bridge-token-auth](../README.md) / BridgeTokenAuth

# Class: BridgeTokenAuth

## Constructors

### new BridgeTokenAuth()

> `private` **new BridgeTokenAuth**(`_configuration`, `_authorizationHandler`, `_db`): [`BridgeTokenAuth`](BridgeTokenAuth.md)

#### Parameters

• **\_configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

• **\_authorizationHandler**: [`AuthorizationHandler`](../../auth/type-aliases/AuthorizationHandler.md)

• **\_db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

#### Returns

[`BridgeTokenAuth`](BridgeTokenAuth.md)

## Properties

### \_authorizationHandler

> `private` `readonly` **\_authorizationHandler**: [`AuthorizationHandler`](../../auth/type-aliases/AuthorizationHandler.md)

***

### \_configuration

> `private` `readonly` **\_configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

***

### \_db

> `private` `readonly` **\_db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

## Methods

### authorizeBridgeToken()

> **authorizeBridgeToken**(`bridgeToken`): `Promise`\<`null` \| `string`\>

#### Parameters

• **bridgeToken**: `string`

#### Returns

`Promise`\<`null` \| `string`\>

***

### generateBridgeToken()

> **generateBridgeToken**(): `string`

#### Returns

`string`

***

### getBridgeToken()

> **getBridgeToken**(`bridgeToken`): `Promise`\<`null` \| `object`\>

#### Parameters

• **bridgeToken**: `string`

#### Returns

`Promise`\<`null` \| `object`\>

***

### setBridgeToken()

> **setBridgeToken**(`bridgeToken`, `service`, `user`): `Promise`\<`void`\>

#### Parameters

• **bridgeToken**: `string`

• **service**: `string`

• **user**: `string`

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(`configuration`, `authorizationHandler`): `Promise`\<[`BridgeTokenAuth`](BridgeTokenAuth.md)\>

#### Parameters

• **configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

• **authorizationHandler**: [`AuthorizationHandler`](../../auth/type-aliases/AuthorizationHandler.md)

#### Returns

`Promise`\<[`BridgeTokenAuth`](BridgeTokenAuth.md)\>
