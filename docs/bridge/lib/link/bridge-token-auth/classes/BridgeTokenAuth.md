[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/link/bridge-token-auth](../README.md) / BridgeTokenAuth

# Class: BridgeTokenAuth

## Implements

- [`TokenAuth`](../../token-auth/interfaces/TokenAuth.md)

## Methods

### authorize()

> **authorize**(`bridgeToken`): `Promise`\<`null` \| [`Credentials`](../../credentials/interfaces/Credentials.md)\>

#### Parameters

• **bridgeToken**: `string`

#### Returns

`Promise`\<`null` \| [`Credentials`](../../credentials/interfaces/Credentials.md)\>

#### Implementation of

[`TokenAuth`](../../token-auth/interfaces/TokenAuth.md).[`authorize`](../../token-auth/interfaces/TokenAuth.md#authorize)

***

### generate()

> **generate**(): `string`

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
