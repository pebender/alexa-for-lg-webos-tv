[**Documentation**](../../../../../../README.md)

***

[Documentation](../../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-bridge](../../../../README.md) / [lib/link/bridge-token-auth](../README.md) / BridgeTokenAuth

# Class: BridgeTokenAuth

## Implements

- [`TokenAuth`](../../token-auth/interfaces/TokenAuth.md)

## Methods

### authorize()

> **authorize**(`bridgeToken`): `Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

#### Parameters

##### bridgeToken

`string`

#### Returns

`Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

#### Implementation of

[`TokenAuth`](../../token-auth/interfaces/TokenAuth.md).[`authorize`](../../token-auth/interfaces/TokenAuth.md#authorize)

***

### generate()

> **generate**(): `string`

#### Returns

`string`

***

### getCredentials()

> **getCredentials**(`bridgeToken`): `Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

#### Parameters

##### bridgeToken

`string`

#### Returns

`Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

***

### setCredentials()

> **setCredentials**(`bridgeToken`, `credentials`): `Promise`\<`void`\>

#### Parameters

##### bridgeToken

`string`

##### credentials

[`Credentials`](../../credentials/interfaces/Credentials.md)

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(`userAuth`, `configurationDirectory`): `Promise`\<`BridgeTokenAuth`\>

#### Parameters

##### userAuth

[`UserAuth`](../../user-auth/classes/UserAuth.md)

##### configurationDirectory

`string`

#### Returns

`Promise`\<`BridgeTokenAuth`\>
