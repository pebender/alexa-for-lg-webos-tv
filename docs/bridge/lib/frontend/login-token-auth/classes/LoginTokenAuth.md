[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/frontend/login-token-auth](../README.md) / LoginTokenAuth

# Class: LoginTokenAuth

## Constructors

### new LoginTokenAuth()

> `private` **new LoginTokenAuth**(`_configuration`, `_x509PublicCert`): [`LoginTokenAuth`](LoginTokenAuth.md)

#### Parameters

• **\_configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

• **\_x509PublicCert**: `Buffer`

#### Returns

[`LoginTokenAuth`](LoginTokenAuth.md)

## Properties

### \_configuration

> `private` `readonly` **\_configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

***

### \_x509PublicCert

> `private` `readonly` **\_x509PublicCert**: `Buffer`

## Methods

### authorizeLoginToken()

> **authorizeLoginToken**(`loginToken`): `Promise`\<`undefined` \| [`LoginTokenAuthRecord`](../interfaces/LoginTokenAuthRecord.md)\>

#### Parameters

• **loginToken**: `string`

#### Returns

`Promise`\<`undefined` \| [`LoginTokenAuthRecord`](../interfaces/LoginTokenAuthRecord.md)\>

***

### build()

> `static` **build**(`configuration`): [`LoginTokenAuth`](LoginTokenAuth.md)

#### Parameters

• **configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

#### Returns

[`LoginTokenAuth`](LoginTokenAuth.md)
