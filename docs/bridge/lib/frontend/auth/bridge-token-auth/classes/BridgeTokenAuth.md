[**alexa-for-lg-webos-tv**](../../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../../modules.md) / [bridge/lib/frontend/auth/bridge-token-auth](../README.md) / BridgeTokenAuth

# Class: BridgeTokenAuth

## Constructors

### new BridgeTokenAuth()

> `private` **new BridgeTokenAuth**(`_configuration`, `_database`): [`BridgeTokenAuth`](BridgeTokenAuth.md)

#### Parameters

• **\_configuration**: [`Configuration`](../../../../configuration/classes/Configuration.md)

• **\_database**: [`DatabaseTable`](../../../../database/classes/DatabaseTable.md)

#### Returns

[`BridgeTokenAuth`](BridgeTokenAuth.md)

## Properties

### \_configuration

> `private` `readonly` **\_configuration**: [`Configuration`](../../../../configuration/classes/Configuration.md)

***

### \_database

> `private` `readonly` **\_database**: [`DatabaseTable`](../../../../database/classes/DatabaseTable.md)

## Methods

### authorizeBridgeToken()

> **authorizeBridgeToken**(`bridgeToken`): `Promise`\<`null` \| [`BridgeTokenAuthRecord`](../interfaces/BridgeTokenAuthRecord.md)\>

#### Parameters

• **bridgeToken**: `string`

#### Returns

`Promise`\<`null` \| [`BridgeTokenAuthRecord`](../interfaces/BridgeTokenAuthRecord.md)\>

***

### generateBridgeToken()

> **generateBridgeToken**(): `string`

#### Returns

`string`

***

### getBridgeToken()

> **getBridgeToken**(`bridgeToken`): `Promise`\<`null` \| [`BridgeTokenAuthRecord`](../interfaces/BridgeTokenAuthRecord.md)\>

#### Parameters

• **bridgeToken**: `string`

#### Returns

`Promise`\<`null` \| [`BridgeTokenAuthRecord`](../interfaces/BridgeTokenAuthRecord.md)\>

***

### setBridgeToken()

> **setBridgeToken**(`bridgeToken`, `bridgeHostname`, `email`, `userId`, `skillToken`): `Promise`\<`void`\>

#### Parameters

• **bridgeToken**: `string`

• **bridgeHostname**: `string`

• **email**: `string`

• **userId**: `string`

• **skillToken**: `string`

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(`configuration`): `Promise`\<[`BridgeTokenAuth`](BridgeTokenAuth.md)\>

#### Parameters

• **configuration**: [`Configuration`](../../../../configuration/classes/Configuration.md)

#### Returns

`Promise`\<[`BridgeTokenAuth`](BridgeTokenAuth.md)\>
