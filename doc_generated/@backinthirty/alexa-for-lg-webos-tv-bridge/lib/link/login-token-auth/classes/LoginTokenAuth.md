[**Documentation**](../../../../../../README.md)

***

[Documentation](../../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-bridge](../../../../README.md) / [lib/link/login-token-auth](../README.md) / LoginTokenAuth

# Class: LoginTokenAuth

Defined in: [packages/bridge/src/lib/link/login-token-auth.ts:9](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/bridge/src/lib/link/login-token-auth.ts#L9)

## Implements

- [`TokenAuth`](../../token-auth/interfaces/TokenAuth.md)

## Methods

### authorize()

> **authorize**(`loginToken`): `Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

Defined in: [packages/bridge/src/lib/link/login-token-auth.ts:28](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/bridge/src/lib/link/login-token-auth.ts#L28)

#### Parameters

##### loginToken

`string`

#### Returns

`Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

#### Implementation of

[`TokenAuth`](../../token-auth/interfaces/TokenAuth.md).[`authorize`](../../token-auth/interfaces/TokenAuth.md#authorize)

***

### build()

> `static` **build**(`userAuth`): `LoginTokenAuth`

Defined in: [packages/bridge/src/lib/link/login-token-auth.ts:17](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/bridge/src/lib/link/login-token-auth.ts#L17)

#### Parameters

##### userAuth

[`UserAuth`](../../user-auth/classes/UserAuth.md)

#### Returns

`LoginTokenAuth`
