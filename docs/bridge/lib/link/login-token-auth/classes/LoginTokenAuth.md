[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/link/login-token-auth](../README.md) / LoginTokenAuth

# Class: LoginTokenAuth

## Implements

- [`TokenAuth`](../../token-auth/interfaces/TokenAuth.md)

## Methods

### authorize()

> **authorize**(`loginToken`): `Promise`\<`null` \| [`Credentials`](../../credentials/interfaces/Credentials.md)\>

#### Parameters

• **loginToken**: `string`

#### Returns

`Promise`\<`null` \| [`Credentials`](../../credentials/interfaces/Credentials.md)\>

#### Implementation of

[`TokenAuth`](../../token-auth/interfaces/TokenAuth.md).[`authorize`](../../token-auth/interfaces/TokenAuth.md#authorize)

***

### build()

> `static` **build**(`userAuth`): [`LoginTokenAuth`](LoginTokenAuth.md)

#### Parameters

• **userAuth**: [`UserAuth`](../../user-auth/classes/UserAuth.md)

#### Returns

[`LoginTokenAuth`](LoginTokenAuth.md)
