[**Documentation**](../../../../../../README.md)

***

[Documentation](../../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-bridge](../../../../README.md) / [lib/link/bridge-token-auth](../README.md) / BridgeTokenAuth

# Class: BridgeTokenAuth

Defined in: [packages/bridge/src/lib/link/bridge-token-auth.ts:17](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/link/bridge-token-auth.ts#L17)

## Implements

- [`TokenAuth`](../../token-auth/interfaces/TokenAuth.md)

## Methods

### authorize()

> **authorize**(`bridgeToken`): `Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

Defined in: [packages/bridge/src/lib/link/bridge-token-auth.ts:44](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/link/bridge-token-auth.ts#L44)

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

Defined in: [packages/bridge/src/lib/link/bridge-token-auth.ts:62](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/link/bridge-token-auth.ts#L62)

#### Returns

`string`

***

### getCredentials()

> **getCredentials**(`bridgeToken`): `Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

Defined in: [packages/bridge/src/lib/link/bridge-token-auth.ts:86](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/link/bridge-token-auth.ts#L86)

#### Parameters

##### bridgeToken

`string`

#### Returns

`Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

***

### setCredentials()

> **setCredentials**(`bridgeToken`, `credentials`): `Promise`\<`void`\>

Defined in: [packages/bridge/src/lib/link/bridge-token-auth.ts:73](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/link/bridge-token-auth.ts#L73)

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

Defined in: [packages/bridge/src/lib/link/bridge-token-auth.ts:29](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/link/bridge-token-auth.ts#L29)

#### Parameters

##### userAuth

[`UserAuth`](../../user-auth/classes/UserAuth.md)

##### configurationDirectory

`string`

#### Returns

`Promise`\<`BridgeTokenAuth`\>
