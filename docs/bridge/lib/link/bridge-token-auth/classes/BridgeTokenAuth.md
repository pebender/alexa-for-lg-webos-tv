[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/link/bridge-token-auth](../README.md) / BridgeTokenAuth

# Class: BridgeTokenAuth

## Constructors

### new BridgeTokenAuth()

> `private` **new BridgeTokenAuth**(`_userAuth`, `_database`): [`BridgeTokenAuth`](BridgeTokenAuth.md)

#### Parameters

• **\_userAuth**: [`UserAuth`](../../user-auth/classes/UserAuth.md)

• **\_database**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)\<[`BridgeTokenAuthRecord`](../type-aliases/BridgeTokenAuthRecord.md)\>

#### Returns

[`BridgeTokenAuth`](BridgeTokenAuth.md)

## Properties

### \_database

> `private` `readonly` **\_database**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)\<[`BridgeTokenAuthRecord`](../type-aliases/BridgeTokenAuthRecord.md)\>

***

### \_userAuth

> `private` `readonly` **\_userAuth**: [`UserAuth`](../../user-auth/classes/UserAuth.md)

## Methods

### authorizeBridgeToken()

> **authorizeBridgeToken**(`bridgeToken`): `Promise`\<`null` \| [`Credentials`](../../credentials/interfaces/Credentials.md)\>

#### Parameters

• **bridgeToken**: `string`

#### Returns

`Promise`\<`null` \| [`Credentials`](../../credentials/interfaces/Credentials.md)\>

***

### generateBridgeToken()

> **generateBridgeToken**(): `string`

#### Returns

`string`

***

### getCredentials()

> **getCredentials**(`bridgeToken`): `Promise`\<`null` \| [`Credentials`](../../credentials/interfaces/Credentials.md)\>

#### Parameters

• **bridgeToken**: `string`

#### Returns

`Promise`\<`null` \| [`Credentials`](../../credentials/interfaces/Credentials.md)\>

***

### setCredentials()

> **setCredentials**(`bridgeToken`, `credentials`): `Promise`\<`void`\>

#### Parameters

• **bridgeToken**: `string`

• **credentials**: [`Credentials`](../../credentials/interfaces/Credentials.md)

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(`userAuth`, `configurationDirectory`): `Promise`\<[`BridgeTokenAuth`](BridgeTokenAuth.md)\>

#### Parameters

• **userAuth**: [`UserAuth`](../../user-auth/classes/UserAuth.md)

• **configurationDirectory**: `string`

#### Returns

`Promise`\<[`BridgeTokenAuth`](BridgeTokenAuth.md)\>
