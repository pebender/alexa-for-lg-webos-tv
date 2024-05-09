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

### authorizeJwTPayload()

> **authorizeJwTPayload**(`jwtPayload`): `Promise`\<`boolean`\>

#### Parameters

• **jwtPayload**: `JwtPayload`

#### Returns

`Promise`\<`boolean`\>

***

### x509PublicCert()

> **x509PublicCert**(): `Buffer`

#### Returns

`Buffer`

***

### build()

> `static` **build**(`configuration`): `Promise`\<[`LoginTokenAuth`](LoginTokenAuth.md)\>

#### Parameters

• **configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

#### Returns

`Promise`\<[`LoginTokenAuth`](LoginTokenAuth.md)\>
