[**alexa-for-lg-webos-tv**](../../../../../README.md)

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/link/login-token-auth](../README.md) / LoginTokenAuth

# Class: LoginTokenAuth

## Implements

- [`TokenAuth`](../../token-auth/interfaces/TokenAuth.md)

## Methods

### authorize()

> **authorize**(`loginToken`): `Promise`\<[`Credentials`](../../credentials/interfaces/Credentials.md) \| `null`\>

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

#### Parameters

##### userAuth

[`UserAuth`](../../user-auth/classes/UserAuth.md)

#### Returns

`LoginTokenAuth`
